import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkContextType {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    type: string;
}

// Ici, on EXÉCUTE la fonction en lui passant "undefined" comme valeur par défaut
const NetworkContext = createContext<NetworkContextType | undefined>(undefined);
interface NetworkProviderProps {
    children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
    const [networkState, setNetworkState] = useState<NetworkContextType>({
        isConnected: true, // Approche optimiste au démarrage
        isInternetReachable: true,
        type: 'unknown',
    });

    useEffect(() => {
        // Écoute des changements d'état du réseau en temps réel
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setNetworkState({
                isConnected: state.isConnected ?? false,
                isInternetReachable: state.isInternetReachable,
                type: state.type,
            });
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <NetworkContext.Provider value={networkState}>
            {children}
        </NetworkContext.Provider>
    );
};

// Hook personnalisé pour consommer le contexte facilement
export const useNetwork = (): NetworkContextType => {
    const context = useContext(NetworkContext);
    if (context === undefined) {
        throw new Error('useNetwork must be used within a NetworkProvider');
    }
    return context;
};