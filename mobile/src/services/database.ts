import * as SQLite from 'expo-sqlite';

// --- TYPES TYPESCRIPT ---
// Ces types assurent que les données manipulées correspondent à ton schéma SQL
export interface LocalIntervention {
    id?: number;
    remote_id: number; // ID provenant de ton backend PostgreSQL
    titre: string;
    adresse: string;
    date: string;
    statut: string;
    description: string | null;
    nomClient: string | null;
    rapport: string | null;
    notes_technicien: string | null;
    failure_reason: string | null;
    signature: string | null;
    equipe?: string | null;
    is_synced: number; // 1 = synchronisé, 0 = modification locale à envoyer
}

export interface LocalMaterial {
    id?: number;
    remote_id: number;
    intervention_remote_id: number;
    material_remote_id: number;
    quantity_required: number;
    to_bring: number;
    is_checked: number; // 0 ou 1
    is_synced: number;
}

export interface LocalPlanningIntervention {
    id: number;
    titre: string;
    adresse: string;
    date: string;
    statut: string;
    description: string
    nomClient: string
    rapport: string | null;
    notes_technicien: string | null;
    failure_reason: string | null;
    signature: string | null;
    equipe: string;
}

// --- CONNEXION ---
// Dans database.ts
export const getDBConnection = async () => {
    return await SQLite.openDatabaseAsync('technician_app_v3.db');
};

// --- INITIALISATION DU SCHÉMA ---
export const initDB = async (): Promise<void> => {
    try {
        const db = await getDBConnection();

        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = ON;



            -- Table des Interventions (Avec 'equipe TEXT')
            CREATE TABLE IF NOT EXISTS interventions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                remote_id INTEGER UNIQUE,
                titre TEXT NOT NULL,
                adresse TEXT NOT NULL,
                date TEXT NOT NULL,
                statut TEXT NOT NULL,
                description TEXT,
                nomClient TEXT,
                rapport TEXT,
                notes_technicien TEXT,
                failure_reason TEXT,
                signature TEXT,
                equipe TEXT, 
                is_synced INTEGER DEFAULT 1
            );

            -- Table du Matériel (Catalogue)
            CREATE TABLE IF NOT EXISTS materials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                remote_id INTEGER UNIQUE,
                name TEXT NOT NULL,
                reference TEXT
            );

            -- Table de l'Inventaire par Intervention
            CREATE TABLE IF NOT EXISTS intervention_materials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                intervention_remote_id INTEGER,
                material_remote_id INTEGER,
                quantity_required INTEGER DEFAULT 1,
                to_bring INTEGER DEFAULT 1,
                is_checked INTEGER DEFAULT 0,
                is_synced INTEGER DEFAULT 1,
                FOREIGN KEY (intervention_remote_id) REFERENCES interventions(remote_id) ON DELETE CASCADE,
                FOREIGN KEY (material_remote_id) REFERENCES materials(remote_id) ON DELETE CASCADE
            );
        `);
        console.log('✅ Base de données SQLite V2 écrasée et initialisée proprement');
    } catch (error) {
        console.error('❌ Erreur initialisation SQLite:', error);
        throw error;
    }
};
// Récupérer une mission précise par son ID distant
export const getLocalInterventionById = async (remoteId: number): Promise<LocalIntervention | null> => {
    try {
        const db = await getDBConnection();
        return await db.getFirstAsync<LocalIntervention>(
            'SELECT * FROM interventions WHERE remote_id = ?',
            [remoteId]
        );
    } catch (error) {
        console.error(`Erreur lecture intervention ${remoteId}:`, error);
        return null;
    }
};

export const getLocalInterventions = async (): Promise<LocalPlanningIntervention[]> => {
    try {
        const db = await getDBConnection();
        return await db.getAllAsync<LocalPlanningIntervention>(
            `SELECT
                 remote_id AS id, titre, adresse, date, statut,
                 description, nomClient, rapport, notes_technicien,
                 failure_reason, signature, equipe
             FROM interventions
             WHERE remote_id IS NOT NULL AND statut NOT IN ('annule', 'archiver')
             ORDER BY date ASC`
        );
    } catch (error) {
        return [];
    }
};
export const getLocalMaterialsByInterventionId = async (interventionRemoteId: number) => {
    try {
        const db = await getDBConnection();
        return await db.getAllAsync(
            `SELECT
                 im.*,
                 im.material_remote_id AS material_id,
                 m.name, m.reference
             FROM intervention_materials im
                      JOIN materials m ON im.material_remote_id = m.remote_id
             WHERE im.intervention_remote_id = ?`,
            [interventionRemoteId]
        );
    } catch (error) {
        return [];
    }
};
// --- FONCTIONS D'ÉCRITURE ---

// Mettre à jour le statut, le rapport ou la signature (Clôture)
export const updateLocalInterventionStatus = async (
    remoteId: number,
    data: {
        statut: string,
        rapport?: string | null,
        notes_technicien?: string | null,
        failure_reason?: string | null,
        signature?: string | null,
        is_synced: number
    }
) => {
    try {
        const db = await getDBConnection();
        await db.runAsync(
            `UPDATE interventions SET 
                statut = ?, 
                rapport = COALESCE(?, rapport), 
                notes_technicien = COALESCE(?, notes_technicien), 
                failure_reason = COALESCE(?, failure_reason), 
                signature = COALESCE(?, signature),
                is_synced = ?
             WHERE remote_id = ?`,
            [
                data.statut,
                data.rapport || null,
                data.notes_technicien || null,
                data.failure_reason || null,
                data.signature || null,
                data.is_synced,
                remoteId
            ]
        );
        return true;
    } catch (error) {
        console.error("Erreur mise à jour locale intervention :", error);
        return false;
    }
};

export const updateLocalMaterialCheck = async (
    interventionRemoteId: number,
    materialIdentifier: number,
    isChecked: number
) => {
    try {
        const db = await getDBConnection();
        const byRemoteId = await db.runAsync(
            'UPDATE intervention_materials SET is_checked = ?, is_synced = 0 WHERE intervention_remote_id = ? AND material_remote_id = ?',
            [isChecked, interventionRemoteId, materialIdentifier]
        );

        if ((byRemoteId?.changes ?? 0) > 0) {
            return true;
        }

        // Fallback: certains écrans peuvent transmettre l'id local de la ligne au lieu du material_remote_id.
        const byLocalRowId = await db.runAsync(
            'UPDATE intervention_materials SET is_checked = ?, is_synced = 0 WHERE intervention_remote_id = ? AND id = ?',
            [isChecked, interventionRemoteId, materialIdentifier]
        );

        if ((byLocalRowId?.changes ?? 0) === 0) {
            console.warn(
                `Aucune ligne mise à jour pour le matériel ${materialIdentifier} sur l'intervention ${interventionRemoteId}`
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erreur updateLocalMaterialCheck:', error);
        return false;
    }
};