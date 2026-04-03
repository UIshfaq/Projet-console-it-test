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

// --- CONNEXION ---
export const getDBConnection = async () => {
    return await SQLite.openDatabaseAsync('technician_app.db');
};

// --- INITIALISATION DU SCHÉMA ---
export const initDB = async (): Promise<void> => {
    try {
        const db = await getDBConnection();

        // Configuration du mode WAL pour la performance et activation des clés étrangères
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = ON;

            -- Table des Interventions (Cache du planning)
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
                remote_id INTEGER UNIQUE,
                intervention_remote_id INTEGER,
                material_remote_id INTEGER,
                quantity_required INTEGER DEFAULT 1,
                to_bring INTEGER DEFAULT 1,
                is_checked INTEGER DEFAULT 0,
                is_synced INTEGER DEFAULT 1
            );
        `);
        console.log('✅ Base de données SQLite locale initialisée');
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

// Récupérer la liste du matériel pour une mission
export const getLocalMaterialsByInterventionId = async (interventionRemoteId: number) => {
    try {
        const db = await getDBConnection();
        return await db.getAllAsync(
            'SELECT * FROM intervention_materials WHERE intervention_remote_id = ?',
            [interventionRemoteId]
        );
    } catch (error) {
        console.error("Erreur lecture matériaux locaux :", error);
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

export const updateLocalMaterialCheck = async (materialRemoteId: number, isChecked: number) => {
    try {
        const db = await getDBConnection();
        // On met is_synced à 0 pour dire au futur script de synchro : "Ceci doit monter au serveur"
        await db.runAsync(
            'UPDATE intervention_materials SET is_checked = ?, is_synced = 0 WHERE remote_id = ?',
            [isChecked, materialRemoteId]
        );
        return true;
    } catch (error) {
        console.error("Erreur mise à jour matériel local :", error);
        return false;
    }
};