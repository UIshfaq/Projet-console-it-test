import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

// 1. On crée le "contexte"
const AuthContext = createContext();

// 2. On crée le "Fournisseur" (Provider)
// C'est le composant qui va gérer la logique
const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);

    // C'est la même logique que vous aviez dans App.js
    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                setUserToken(token);
            } catch (e) {
                console.error("Erreur en lisant le token", e);
            }
            setIsLoading(false);
        };
        checkToken()
    }, []);

    // 3. On crée les fonctions "login" et "logout"
    const authContextValue = {
        login: async (token) => {
            setIsLoading(true);
            await SecureStore.setItemAsync('userToken', token);
            setUserToken(token);
            setIsLoading(false);
        },
        logout: async () => {
            setIsLoading(true);
            await SecureStore.deleteItemAsync('userToken');
            setUserToken(null);
            setIsLoading(false);
        },
        userToken: userToken, // On expose le token
        isLoading: isLoading, // On expose l'état de chargement
    };

    // 4. On "fournit" ces valeurs à tous les enfants
    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// 5. On exporte le tout
export { AuthContext, AuthProvider };