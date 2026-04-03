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
}

// src/services/sync.ts

export const syncUpdatesUp = async (): Promise<void> => {
    try {
        const db = await getDBConnection();

        // 1. Chercher les interventions modifiées localement
        const pendingInterventions = await db.getAllAsync<any>(
            'SELECT * FROM interventions WHERE is_synced = 0'
        );

        console.log(`📤 ${pendingInterventions.length} interventions en attente de synchro montante`);

        for (const interv of pendingInterventions) {
            try {
                // Vérifier que remote_id existe
                if (!interv.remote_id) {
                    console.warn(`⚠️ Intervention sans remote_id, ignorée`);
                    continue;
                }

                await axiosMobile.put(`/interventions/${interv.remote_id}`, {
                    statut: interv.statut,
                    rapport: interv.rapport,
                    notes_technicien: interv.notes_technicien,
                    failure_reason: interv.failure_reason,
                    signature: interv.signature
                });
                // Si l'appel API réussit, on marque comme synchronisé
                await db.runAsync('UPDATE interventions SET is_synced = 1 WHERE remote_id = ?', [interv.remote_id]);
            } catch (error: any) {
                // Si c'est une erreur 401, elle sera gérée par l'interceptor
                if (error.response?.status === 401) {
                    console.warn("🔒 Token expiré pendant syncUpdatesUp");
                    throw error; // Propaguer pour arrêter la synchro
                }
                console.warn(`⚠️ Erreur synchro montante intervention ${interv.remote_id}:`, error);
            }
        }

        // 2. Chercher les matériaux cochés localement
        const pendingMaterials = await db.getAllAsync<any>(
            'SELECT * FROM intervention_materials WHERE is_synced = 0'
        );

        console.log(`📤 ${pendingMaterials.length} matériaux en attente de synchro montante`);

        for (const mat of pendingMaterials) {
            try {
                // Vérifier que les IDs existent
                if (!mat.intervention_remote_id || !mat.material_remote_id) {
                    console.warn(`⚠️ Matériel sans remote_id, ignoré`);
                    continue;
                }

                await axiosMobile.put(`/inventaires/${mat.intervention_remote_id}/materials/${mat.material_remote_id}`, {
                    is_checked: mat.is_checked
                });
                await db.runAsync('UPDATE intervention_materials SET is_synced = 1 WHERE remote_id = ?', [mat.remote_id]);
            } catch (error: any) {
                if (error.response?.status === 401) {
                    console.warn("🔒 Token expiré pendant syncUpdatesUp (materials)");
                    throw error;
                }
                console.warn(`⚠️ Erreur synchro montante matériel ${mat.remote_id}:`, error);
            }
        }

        console.log("✅ Synchronisation montante terminée avec succès.");
    } catch (error) {
        console.error("▲ Échec de la synchronisation montante :", error);
        throw error; // Propaguer l'erreur pour arrêter la synchro
    }
};

export const syncInterventionsDown = async (idUser: number): Promise<void> => {
    try {
        const response = await axiosMobile.get<RemoteIntervention[]>(`/interventions/${idUser}`);
        const remoteInterventions = response.data;

        // --- SÉCURITÉ : On vérifie que c'est bien une liste ---
        if (!Array.isArray(remoteInterventions)) {
            console.warn("⚠️ Format reçu invalide (attendu: Array) :", remoteInterventions);
            return;
        }

        const db = await getDBConnection();
        const statement = await db.prepareAsync(`
            INSERT OR REPLACE INTO interventions (
                remote_id, titre, adresse, date, statut, 
                description, nomClient, rapport, notes_technicien, failure_reason, is_synced
            ) VALUES (
            $remote_id, $titre, $adresse, $date, $statut,
            $description, $nomClient, $rapport, $notes_technicien, $failure_reason, 1
            )
        `);

        for (const interv of remoteInterventions) {
            await statement.executeAsync({
                $remote_id: interv.id,
                $titre: interv.titre,
                $adresse: interv.adresse,
                $date: typeof interv.date === 'string' ? interv.date : new Date(interv.date).toISOString(),
                $statut: interv.statut,
                $description: interv.description || null,
                $nomClient: interv.nomClient || null,
                $rapport: interv.rapport || null,
                $notes_technicien: interv.notes_technicien || null,
                $failure_reason: interv.failure_reason || null,
            });
        }

        await statement.finalizeAsync();

        console.log(`✅ ${remoteInterventions.length} interventions synchronisées en local.`);
    } catch (error) {
        console.error('❌ Échec de la synchronisation des interventions:', error);
        throw error;
    }
};