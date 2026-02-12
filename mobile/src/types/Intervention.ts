
export type InterventionStatus = 'prévu' | 'en_cours' | 'termine' | 'annule' | 'archiver' | 'echec';

export interface Intervention {
    id: number;
    titre: string;
    adresse: string;
    date: string; // Format SQL: YYYY-MM-DD
    statut: InterventionStatus;

    technicien_id: number | null;

    // Champs optionnels ou nullables (selon ton SQL)
    description?: string | null;
    nomClient?: string | null;

    // Géolocalisation
    latitude?: number | null;
    longitude?: number | null;

    // Champs de fin de mission
    rapport?: string | null;
    notes_technicien?: string | null;
    failure_reason?: string | null;
    signature?: string | null;

    created_at?: string;
    updated_at?: string;

    // Champs souvent ajoutés par l'API (Jointures) même si pas dans la table principale
    materials?: any[];
}