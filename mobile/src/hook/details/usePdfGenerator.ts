import { useState, useContext } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { AuthContext } from '../../contextes/AuthContext';

export const usePdfGenerator = () => {
    // 1. Extraction propre du token
    const { userToken } = useContext(AuthContext);

    // 2. État pour gérer le chargement (utile pour l'UI)
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    const generateAndSharePdf = async (interventionId: number) => {
        if (!userToken) {
            Alert.alert("Erreur", "Vous devez être connecté pour générer ce document.");
            return;
        }

        setIsDownloading(true);

        try {
            const url = `${process.env.EXPO_PUBLIC_API_URL}/api/generate-pdf/${interventionId}`;

            // On définit le chemin temporaire où le fichier sera stocké sur le téléphone
            const fileUri = `${FileSystem.cacheDirectory}Intervention_${interventionId}.pdf`;
            console.log(`➡️ Téléchargement en cours depuis : ${url}`);

            // 3. FileSystem s'occupe de l'appel HTTP et de l'écriture en une seule étape !
            const downloadResult = await FileSystem.downloadAsync(url, fileUri, {
                headers: {
                    Authorization: `Bearer ${userToken}` // On n'oublie pas la sécurité
                }
            });

            if (downloadResult.status !== 200) {
                Alert.alert("Erreur", "Impossible de récupérer le document.");
                return;
            }

            console.log(`✅ Fichier stocké : ${downloadResult.uri}`);

            // 4. On demande au système d'ouvrir la modale de partage native
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(downloadResult.uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Bon d\'intervention', // Utile sur Android
                    UTI: 'com.adobe.pdf' // Utile sur iOS
                });
            } else {
                Alert.alert("Info", "Le partage ou l'ouverture de PDF n'est pas disponible sur cet appareil.");
            }

        } catch (error) {
            console.error("❌ Erreur lors du traitement du PDF:", error);
            Alert.alert("Erreur", "Un problème est survenu lors de la génération.");
        } finally {
            setIsDownloading(false);
        }
    };

    // Le hook renvoie la fonction d'action ET l'état de chargement
    return { generateAndSharePdf, isDownloading };
};