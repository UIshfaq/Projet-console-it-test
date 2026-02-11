import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
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
// On utilise "as AuthContextType" pour éviter de devoir fournir une valeur par défaut complexe ici.
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// 3. Typage des props du Provider (pour que 'children' soit accepté)
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

    useEffect(() => {
        checkToken();
    }, []);

    // 4. L'objet value DOIT correspondre à l'interface AuthContextType
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
        logout: async () => {
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
        }
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
            </AuthContext.Provider>
    );
};