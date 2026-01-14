export interface User {
    id: number;
    nom: string;
    email: string;
    role: 'admin' | 'technicien'
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User; 
}