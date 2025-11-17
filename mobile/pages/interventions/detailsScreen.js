import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import axios from "axios";
import { AuthContext } from "../../contextes/AuthContexte";

// 1. On récupère 'route' pour avoir accès aux paramètres passés depuis la liste
function DetailScreen({ route }) {

    // 2. On récupère l'objet 'intervention' qu'on a cliqué dans la liste
    // (Rappelle-toi : navigation.navigate('DetailIntervention', { intervention: item }))
    const { intervention } = route.params;

    const [detailIntervention, setDetailIntervention] = useState(null);
    const [loading, setLoading] = useState(true);
    const { userToken } = useContext(AuthContext);

    const chargerDescription = async () => {
        // 3. On construit l'URL avec l'ID à la fin
        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/${intervention.id}`;

        try {
            const response = await axios.get(backendUrl, {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            });

            // 4. On stocke le résultat (qui contient la description) dans le State
            setDetailIntervention(response.data);
            setLoading(false);

        } catch (e) {
            console.error("Erreur API :", e);
            setLoading(false);
        }
    }

    // 5. useEffect lance la fonction UNE SEULE FOIS au démarrage
    useEffect(() => {
        chargerDescription();
    }, []);

    // Petit chargement pendant qu'on va chercher les infos
    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={{marginTop: 50}} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titre}>Détails de l'intervention</Text>

            <Text style={styles.label}>Titre :</Text>
            <Text style={styles.text}>{detailIntervention.titre}</Text>

            <Text style={styles.label}>Description (récupérée du serveur) :</Text>
            <Text style={styles.description}>
                {detailIntervention.description || "Aucune description disponible."}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    titre: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    label: { fontSize: 16, fontWeight: 'bold', marginTop: 10, color: 'gray' },
    text: { fontSize: 16, marginBottom: 5 },
    description: { fontSize: 16, color: '#333', padding: 10, backgroundColor: '#eee', borderRadius: 5 }
});

export default DetailScreen;