export interface User {
    id: number;
    nom: string;
    email: string;
    phone_number?: string;
    password_hash: string;
    role: 'admin' | 'technicien';
    isActive: number;
    created_at: Date;
    updated_at: Date;
}

