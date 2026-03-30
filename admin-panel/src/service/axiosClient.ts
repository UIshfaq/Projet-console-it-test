import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
// 1. Création de l'instance avec l'URL de base
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 2. Intercepteur de REQUÊTE : Ajoute le token avant chaque appel
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 3. Intercepteur de RÉPONSE : Gère les erreurs renvoyées par le Backend
axiosClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response; // Tout va bien, on laisse passer
    },
    (error: AxiosError) => {
        // Si le serveur dit "401 Non Autorisé" (token faux ou expiré)
        if (error.response && error.response.status === 403) {
            console.warn("🔒 [Auth] Token expiré ou invalide. Déconnexion forcée.");

            // On supprime le mauvais token
            localStorage.removeItem('adminToken');

            // On renvoie vers le login (si on n'y est pas déjà)
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;