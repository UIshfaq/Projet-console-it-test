export interface Intervention {
    id: number;
    titre: string;
    adresse: string;
    date: string;
    statut: 'prévu' | 'en_cours' | 'termine' | 'annule' | 'archiver' | 'echec';
    nomClient: string;
    description?: string;
    rapport?: string;
    notes_technicien?: string;
    failure_reason?: string;
    signature?: string;
    created_at?: string;
    updated_at?: string;
    materials?: {
        id: number;
        name: string;
        quantity_required: number;
        is_checked: boolean;
        to_bring: boolean;
    }[];
    technicians?: {
        id: number;
        nom: string;
    }[];
}