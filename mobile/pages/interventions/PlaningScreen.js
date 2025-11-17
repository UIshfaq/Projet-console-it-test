import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from "axios";
import { AuthContext } from '../../contextes/AuthContexte';
import { Ionicons } from '@expo/vector-icons';

function InterventionScreen({ navigation }) {
    // 1. Déclarer l'état
    const [interventions, setInterventions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 2. Récupérer le token du contexte
    const { userToken } = useContext(AuthContext);

    const afficherInterventions = async () => {
        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/`;

        if (!userToken) {
            console.log("Attente du token...");
            return;
        }

        try {
            const response = await axios.get(backendUrl, {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            });
            setInterventions(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Erreur API :", error.response?.data || error.message);
            setIsLoading(false);
        }
    }

    // Fonction utilitaire pour la date
    const formatDate = (dateString) => {
        if (!dateString) return "--/--";
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    };

    // 3. useEffect
    useEffect(() => {
        afficherInterventions();
    }, [userToken]);

    // 4. Le design d'une ligne (C'EST ICI QUE CA CHANGE)
    const renderItem = ({ item }) => (
        // On remplace la View par TouchableOpacity ici !
        <TouchableOpacity
            style={styles.row}
            onPress={() => {
                // On navigue vers la page de détails avec les infos de CETTE ligne
                navigation.navigate('Detail', { intervention: item });
            }}
        >
            {/* Colonne DATE */}
            <Text style={styles.cellDate}>
                {formatDate(item.date || item.date_debut)}
            </Text>

            {/* Colonne INFO */}
            <View style={styles.cellMain}>
                <Text style={styles.clientName}>{item.titre || "Intervention"}</Text>
                <Text style={styles.interventionType} numberOfLines={1}>
                    {item.adresse || "Pas d'adresse"}
                </Text>
            </View>

            {/* Colonne STATUT */}
            <Text style={[
                styles.cellStatus,
                {
                    color:
                        item.statut === 'en_cours' ? 'orange' :
                            (item.statut === 'prevu' || item.statut === 'prévu') ? 'blue' :
                                (item.statut === 'termine' || item.statut === 'terminé') ? 'red' : 'gray'
                }
            ]}>
                {item.statut}
            </Text>

            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    // 5. Écran de chargement
    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{marginTop: 10}}>Chargement du planning...</Text>
            </View>
        );
    }

    // 6. L'AFFICHAGE PRINCIPAL (Remis au propre)
    return (
        <SafeAreaView style={styles.container}>
            {/* En-tête du tableau */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Date</Text>
                <Text style={styles.headerText}>Intervention</Text>
                <Text style={styles.headerText}>État</Text>
            </View>

            {/* La Liste */}
            <FlatList
                data={interventions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                ListEmptyComponent={<Text style={{padding: 20, textAlign:'center'}}>Aucune intervention prévue.</Text>}
            />
        </SafeAreaView>
    );
}

// --- LES STYLES ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', backgroundColor: '#ddd', paddingVertical: 10, paddingHorizontal: 15 },
    headerText: { fontWeight: 'bold', fontSize: 14, color: '#444', marginRight: 15 }, // Petit ajustement pour espacer

    row: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },

    cellDate: { width: 50, fontWeight: 'bold', fontSize: 14, color: '#333' },
    cellMain: { flex: 1, paddingHorizontal: 10 },
    cellStatus: { width: 70, fontSize: 12, textAlign: 'right', fontWeight: '600' },

    clientName: { fontSize: 16, fontWeight: '600', color: '#000' },
    interventionType: { fontSize: 13, color: 'gray', marginTop: 2 },
});

export default InterventionScreen;