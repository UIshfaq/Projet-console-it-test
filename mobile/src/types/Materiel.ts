
export interface Material {
    id: number;
    material_id?: number; // Parfois l'API renvoie l'un ou l'autre
    name: string;
    reference?: string;
    quantity_required: number;
    to_bring: boolean | number; // L'API renvoie parfois 0/1 ou true/false
    is_checked?: boolean | number;
    stock_quantity?: number; // Pour l'écran d'inventaire global
}