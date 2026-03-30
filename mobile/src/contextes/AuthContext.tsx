import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Platform, DeviceEventEmitter } from 'react-native'; // 1. Ajout de DeviceEventEmitter
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Définition stricte de ce que contient le contexte
interface AuthContextType {
    isLoading: boolean;
    userToken: string | null;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
}

// 2. Création du contexte
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// 3. Typage des props du Provider
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [userToken, setUserToken] = useState<string | null>(null);

    const checkToken = async () => {
        try {
            let token: string | null = null;
            if (Platform.OS === 'web') {
                token = await AsyncStorage.getItem('userToken');
            } else {
                token = await SecureStore.getItemAsync('userToken');
            }
            setUserToken(token);
        } catch (e) {
            console.error("Erreur lecture token", e);
        } finally {
            setIsLoading(false);
        }
    };

    // 4. On extrait la fonction logout pour pouvoir l'utiliser partout
    const logout = async () => {
        setIsLoading(true);
        try {
            if (Platform.OS === 'web') {
                await AsyncStorage.removeItem('userToken');
            } else {
                await SecureStore.deleteItemAsync('userToken');
            }
            setUserToken(null);
        } catch (e) {
            console.error("Erreur suppression token", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Au démarrage, on vérifie s'il y a un token
        checkToken();

        // 5. MISE SUR ÉCOUTE : On écoute le signal d'erreur de axiosMobile.ts
        const listener = DeviceEventEmitter.addListener('custom_force_logout', async () => {
            await logout(); // On lance ta propre fonction de déconnexion propre
        });

        // On nettoie l'écouteur si le composant est détruit
        return () => {
            listener.remove();
        };
    }, []);

    // 6. L'objet value correspond toujours parfaitement à l'interface
    const authContextValue: AuthContextType = {
        isLoading,
        userToken,
        login: async (token: string) => {
            setIsLoading(true);
            try {
                if (Platform.OS === 'web') {
                    await AsyncStorage.setItem('userToken', token);
                } else {
                    await SecureStore.setItemAsync('userToken', token);
                }
                setUserToken(token);
            } catch (e) {
                console.error("Erreur sauvegarde token", e);
            } finally {
                setIsLoading(false);
            }
        },
        logout // On injecte la fonction qu'on a définie plus haut
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};