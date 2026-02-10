export interface Intervention {
    id: number;
    titre: string;
    adresse: string;
    date: Date | string; // Date objet côté BDD, string côté JSON
    statut: 'prévu' | 'en_cours' | 'termine' | 'annule' | 'archiver' | 'echec';
    technicien_id: number | null; // Peut être null selon ton SQL
    created_at: Date;
    updated_at: Date;

    // Champs optionnels (nullable dans ta BDD)
    description?: string;
    latitude?: number;
    longitude?: number;
    nomClient?: string;
    rapport?: string;
    notes_technicien?: string;
    failure_reason?: string;
    signature?: string;
}