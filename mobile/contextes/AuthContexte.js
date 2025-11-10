import React, { createContext, useState, useEffect } from 'react';
import { Platform } from 'react-native'; // <-- CORRECTION N°2 (Import manquant)
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <-- CORRECTION N°1 (Le bon import)

// 1. On crée le "contexte"
const AuthContext = createContext();

// 2. On crée le "Fournisseur"
const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);

    // --- CORRECTION N°3 (Logique de useEffect) ---
    // Cette fonction vérifie le token AU DÉMARRAGE
    useEffect(() => {
        const checkToken = async () => {
            let token;
            try {
                if (Platform.OS === 'web') {
                    // On LIT (getItem) depuis le "placard" web
                    token = await AsyncStorage.getItem('userToken');
                } else {
                    // On LIT (getItemAsync) depuis le "coffre-fort" mobile
                    token = await SecureStore.getItemAsync('userToken');
                }
                setUserToken(token);
            } catch (e) {
                console.error("Erreur en lisant le token", e);
            }
            setIsLoading(false);
        };
        checkToken();
    }, []); // Le [] vide est crucial (s'exécute 1 fois)


    // 3. On crée les fonctions "login" et "logout"
    const authContextValue = {

        // --- CORRECTION N°4 (Logique de login) ---
        login: async (token) => {
            setIsLoading(true);
            try {
                if (Platform.OS === 'web') {
                    // On ÉCRIT (setItem) dans le "placard" web
                    await AsyncStorage.setItem('userToken', token);
                } else {
                    // On ÉCRIT (setItemAsync) dans le "coffre-fort" mobile
                    await SecureStore.setItemAsync('userToken', token);
                }
                setUserToken(token);
            } catch (e) {
                console.error("Erreur en sauvegardant le token", e);
            }
            setIsLoading(false);
        },

        // --- CORRECTION N°4 (Logique de logout) ---
        logout: async () => {
            setIsLoading(true);
            try {
                if (Platform.OS === 'web') {
                    // On SUPPRIME (removeItem) du "placard" web
                    await AsyncStorage.removeItem('userToken');
                } else {
                    // On SUPPRIME (deleteItemAsync) du "coffre-fort" mobile
                    await SecureStore.deleteItemAsync('userToken');
                }
                setUserToken(null);
            } catch (e) {
                console.error("Erreur en supprimant le token", e);
            }
            setIsLoading(false);
        },

        userToken: userToken,
        isLoading: isLoading,
    };

    // 4. On "fournit" ces valeurs
    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// 5. On exporte le tout
export { AuthContext, AuthProvider };