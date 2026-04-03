import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { DeviceEventEmitter, Platform } from 'react-native';

export const AuthContext = createContext<any>(null);

const getStoredToken = async (): Promise<string | null> => {
    if (Platform.OS === 'web') return AsyncStorage.getItem('userToken');
    const secureToken = await SecureStore.getItemAsync('userToken');
    if (secureToken) return secureToken;
    // Fallback pour migrer les anciennes sessions stockées uniquement en AsyncStorage
    return AsyncStorage.getItem('userToken');
};

const setStoredToken = async (token: string): Promise<void> => {
    if (Platform.OS === 'web') {
        await AsyncStorage.setItem('userToken', token);
        return;
    }
    await SecureStore.setItemAsync('userToken', token);
    // Copie de compat pour anciens chemins de lecture
    await AsyncStorage.setItem('userToken', token);
};

const clearStoredToken = async (): Promise<void> => {
    await AsyncStorage.removeItem('userToken');
    if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync('userToken');
    }
};

export const AuthProvider = ({ children }: any) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null); // <-- AJOUT DE L'ID
    const [isLoading, setIsLoading] = useState(true);

    // Définir logout avant les useEffect qui l'utilisent
    const logout = useCallback(async () => {
        await clearStoredToken();
        await AsyncStorage.removeItem('userId');
        setUserToken(null);
        setUserId(null);
    }, []);

    const login = useCallback(async (token: string, id: number) => {
        try {
            await setStoredToken(token);
            await AsyncStorage.setItem('userId', id.toString()); // On stocke l'ID

            setUserToken(token);
            setUserId(id);
        } catch (e) {
            console.error(e);
        }
    }, []);

    // Au démarrage de l'app : on récupère le Token ET l'ID
    useEffect(() => {
        const loadStorageData = async () => {
            try {
                const token = await getStoredToken();
                const id = await AsyncStorage.getItem('userId');

                if (token) setUserToken(token);
                if (id) setUserId(parseInt(id, 10)); // On convertit le texte en nombre
            } catch (e) {
                console.log("Erreur chargement storage", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadStorageData();
    }, []);

    // Écouter l'événement force_logout émis par l'interceptor axios
    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('custom_force_logout', () => {
            // Ne logout QUE si l'utilisateur est VRAIMENT connecté
            // (évite les faux positifs lors de la première synchro)
            if (userToken) {
                console.log("🔒 Déconnexion forcée par l'API (401)");
                logout();
            }
        });

        return () => subscription.remove();
    }, [userToken, logout]);

    return (
        <AuthContext.Provider value={{
            userToken,
            userId, // <-- ON EXPOSE L'ID ICI
            isLoading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};