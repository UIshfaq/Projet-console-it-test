import { getDBConnection } from './database';
import axiosMobile from "../api/axiosMobile";

export interface RemoteIntervention {
    id: number;
    titre: string;
    adresse: string;
    date: string;
    statut: string;
    description: string | null;
    nomClient: string | null;
    rapport: string | null;
    notes_technicien: string | null;
    failure_reason: string | null;
    signature?: string | null;
    equipe?: string | null;
    materials?: any[];
}

const syncOneIntervention = async (interv: any): Promise<void> => {
    const status = interv.statut;

    if (status === 'archiver') {
        await axiosMobile.patch(`/interventions/${interv.remote_id}/archive`);
        return;
    }

    if (status === 'termine' || status === 'echec') {
        await axiosMobile.put(`/interventions/${interv.remote_id}`, {
            statut: interv.statut,
            rapport: interv.rapport,
            notes_technicien: interv.notes_technicien,
            failure_reason: interv.failure_reason,
            signature: interv.signature,
        });
        return;
    }

    // Statuts en cours/prevision: mise a jour notes + rapport uniquement
    await axiosMobile.patch(`/interventions/${interv.remote_id}/modifier`, {
        rapport: interv.rapport,
        notes_technicien: interv.notes_technicien,
    });
};

// src/services/sync.ts

export const syncUpdatesUp = async (): Promise<void> => {
    try {
        const db = await getDBConnection();

        // 1. Interventions (inchangé)
        const pendingInterventions = await db.getAllAsync<any>('SELECT * FROM interventions WHERE is_synced = 0');
        for (const interv of pendingInterventions) {
            try {
                if (!interv.remote_id) continue;
                await syncOneIntervention(interv);
                await db.runAsync('UPDATE interventions SET is_synced = 1 WHERE remote_id = ?', [interv.remote_id]);
            } catch (error: any) {
                if (error.response?.status === 401) throw error;
                console.error(`❌ Sync intervention échouée (remote_id=${interv.remote_id})`, error?.response?.data || error);
                throw error;
            }
        }

        // 2. Matériaux (Mise à jour de la clause WHERE)
        const pendingMaterials = await db.getAllAsync<any>('SELECT * FROM intervention_materials WHERE is_synced = 0');
        for (const mat of pendingMaterials) {
            try {
                if (!mat.intervention_remote_id || !mat.material_remote_id) continue;
                await axiosMobile.put(`/inventaires/${mat.intervention_remote_id}/materials/${mat.material_remote_id}`, {
                    is_checked: mat.is_checked
                });
                await db.runAsync(
                    'UPDATE intervention_materials SET is_synced = 1 WHERE intervention_remote_id = ? AND material_remote_id = ?',
                    [mat.intervention_remote_id, mat.material_remote_id]
                );
            } catch (error: any) {
                if (error.response?.status === 401) throw error;
                console.error(
                    `❌ Sync matériel échouée (intervention=${mat.intervention_remote_id}, material=${mat.material_remote_id})`,
                    error?.response?.data || error
                );
                throw error;
            }
        }
    } catch (error) {
        throw error;
    }
};

export const syncInterventionsDown = async (_idUser: number): Promise<void> => {
    try {
        const response = await axiosMobile.get<any[]>('/interventions/');
        const remoteInterventions = response.data;
        if (!Array.isArray(remoteInterventions)) return;

        const db = await getDBConnection();

        const pendingLocalMaterials = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM intervention_materials WHERE is_synced = 0'
        );
        if ((pendingLocalMaterials?.count ?? 0) > 0) {
            console.warn('⚠️ Sync down ignorée: des checks matériels locaux ne sont pas encore synchronisés.');
            return;
        }

        for (const interv of remoteInterventions) {
            let fullInterv: RemoteIntervention = interv;

            // On récupère les détails complets pour avoir l'équipe et le matériel en cache offline.
            try {
                const detailResponse = await axiosMobile.get<RemoteIntervention>(`/interventions/${interv.id}`);
                if (detailResponse?.data) {
                    fullInterv = detailResponse.data;
                }
            } catch {
                // Fallback silencieux sur la version liste si un détail échoue.
            }

            // 1. Sauvegarder l'intervention (ON INSERE 'equipe' DIRECTEMENT !)
            await db.runAsync(`
                INSERT INTO interventions (
                    remote_id, titre, adresse, date, statut,
                    description, nomClient, rapport, notes_technicien, failure_reason, signature, equipe, is_synced
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                    ON CONFLICT(remote_id) DO UPDATE SET
                    titre = excluded.titre, adresse = excluded.adresse, date = excluded.date,
                                                  statut = excluded.statut, description = excluded.description, nomClient = excluded.nomClient,
                                                  rapport = excluded.rapport, notes_technicien = excluded.notes_technicien,
                                                  failure_reason = excluded.failure_reason, signature = excluded.signature,
                                                  equipe = excluded.equipe, is_synced = 1
            `, [
                fullInterv.id, fullInterv.titre, fullInterv.adresse,
                typeof fullInterv.date === 'string' ? fullInterv.date : new Date(fullInterv.date).toISOString(),
                fullInterv.statut, fullInterv.description ?? null, fullInterv.nomClient ?? null,
                fullInterv.rapport ?? null, fullInterv.notes_technicien ?? null, fullInterv.failure_reason ?? null, fullInterv.signature ?? null,
                fullInterv.equipe ?? null
            ]);

            // 2. Nettoyer et Sauvegarder le Matériel
            await db.runAsync('DELETE FROM intervention_materials WHERE intervention_remote_id = ?', [fullInterv.id]);

            if (Array.isArray(fullInterv.materials)) {
                for (const mat of fullInterv.materials) {
                    const materialId = mat.id; // Ton JSON utilise "id"

                    await db.runAsync(`
                        INSERT INTO materials (remote_id, name) VALUES (?, ?)
                            ON CONFLICT(remote_id) DO UPDATE SET name = excluded.name
                    `, [materialId, mat.name || 'Inconnu']);

                    await db.runAsync(`
                        INSERT INTO intervention_materials (
                            intervention_remote_id, material_remote_id, quantity_required, to_bring, is_checked, is_synced
                        ) VALUES (?, ?, ?, ?, ?, 1)
                    `, [
                        fullInterv.id, materialId, mat.quantity_required || 1,
                        mat.to_bring !== undefined ? mat.to_bring : 1, mat.is_checked || 0
                    ]);
                }
            }
        }
        console.log(`✅ ${remoteInterventions.length} interventions synchronisées avec équipe et matériel.`);
    } catch (error) {
        console.error('❌ Échec de la synchronisation:', error);
        throw error;
    }
};