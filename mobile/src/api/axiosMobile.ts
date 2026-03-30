import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { DeviceEventEmitter, Platform } from "react-native";

const axiosMobile = axios.create({
    baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api`,
});

// Fonction utilitaire pour récupérer le token selon la plateforme
const getToken = async () => {
    if (Platform.OS === 'web') {
        return await AsyncStorage.getItem('userToken');
    } else {
        return await SecureStore.getItemAsync('userToken');
    }
};

// Fonction utilitaire pour supprimer le token selon la plateforme
const removeToken = async () => {
    if (Platform.OS === 'web') {
        await AsyncStorage.removeItem('userToken');
    } else {
        await SecureStore.deleteItemAsync('userToken');
    }
};

axiosMobile.interceptors.request.use(async (config) => {
    const token = await getToken();

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosMobile.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("🔒 [Auth] Token expiré ou invalide. Déconnexion...");
            
            // 1. On vide le stockage (cohérent avec la plateforme)
            await removeToken();
            
            // 2. On émet l'event pour que le AuthContext mette à jour userToken à null
            // C'est ce changement d'état dans App.tsx qui fera la redirection automatique
            DeviceEventEmitter.emit('custom_force_logout');
        }
        return Promise.reject(error);
    }
);

export default axiosMobile;