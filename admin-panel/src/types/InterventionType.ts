export interface Intervention {
    id: number;
    titre: string;
    adresse: string;
    date: string;
    statut: 'prévu' | 'en_cours' | 'termine' | 'annule' | 'archiver' | 'echec';
    technicien_id: number;
    nomClient: string;
    technicien_nom?: string;
}