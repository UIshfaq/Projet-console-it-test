export interface User {
    id: number;
    nom: string;
    email: string;
    phone_number: string;
    role: 'admin' | 'technicien'
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User; 
}