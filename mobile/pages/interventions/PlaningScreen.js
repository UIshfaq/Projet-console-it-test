import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from "axios";
import { AuthContext } from '../../contextes/AuthContexte';
import { Ionicons } from '@expo/vector-icons';

function InterventionScreen({ navigation }) {
    const [interventions, setInterventions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { userToken } = useContext(AuthContext);

    const afficherInterventions = async () => {

        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/`;
        if (!userToken) return;

        try {
            const response = await axios.get(backendUrl, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setInterventions(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Erreur API :", error.response?.data || error.message);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        afficherInterventions();
    }, [userToken]);

    // --- FONCTIONS DE FORMATAGE VISUEL ---

    // Sépare le jour et le mois pour le design "Calendrier"
    const getDateParts = (dateString) => {
        if (!dateString) return { day: '--', month: '--' };
        const date = new Date(dateString);
        const day = date.toLocaleDateString('fr-FR', { day: '2-digit' });
        const month = date.toLocaleDateString('fr-FR', { month: 'short' });
        return { day, month: month.replace('.', '') }; // Enlève le point du mois (janv.)
    };

    // Gère les couleurs du badge de statut
    const getStatusStyle = (status) => {
        switch (status) {
            case 'en_cours': return { bg: '#FFF4E5', text: '#FF9800', label: 'En Cours' };
            case 'termine':
            case 'terminé': return { bg: '#E8F5E9', text: '#4CAF50', label: 'Terminé' };
            case 'prevu':
            case 'prévu': return { bg: '#E3F2FD', text: '#2196F3', label: 'Prévu' };
            default: return { bg: '#F5F5F5', text: '#9E9E9E', label: status };
        }
    };

    // --- RENDU D'UNE CARTE (ITEM) ---
    const renderItem = ({ item }) => {
        const { day, month } = getDateParts(item.date || item.date_debut);
        const statusStyle = getStatusStyle(item.statut);

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7} // Effet visuel au clic
                onPress={() => navigation.navigate('Detail', { intervention: item })}
            >
                {/* BLOC DATE (Gauche) */}
                <View style={styles.dateBox}>
                    <Text style={styles.dateDay}>{day}</Text>
                    <Text style={styles.dateMonth}>{month}</Text>
                </View>

                {/* BLOC INFO (Centre) */}
                <View style={styles.contentBox}>
                    {/* Titre et Statut (Ligne du haut) */}
                    <View style={styles.topRow}>
                        <Text style={styles.title} numberOfLines={1}>
                            {item.titre || "Intervention"}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                            <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                {statusStyle.label}
                            </Text>
                        </View>
                    </View>

                    {/* Client */}
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={14} color="#666" style={{ marginRight: 5 }} />
                        <Text style={styles.subText} numberOfLines={1}>
                            {item.nomClient || item.client || "Client non spécifié"}
                        </Text>
                    </View>

                    {/* Adresse */}
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={14} color="#666" style={{ marginRight: 5 }} />
                        <Text style={styles.subText} numberOfLines={1}>
                            {item.adresse || "Pas d'adresse"}
                        </Text>
                    </View>
                </View>

                {/* FLÈCHE (Droite) */}
                <View style={styles.arrowBox}>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Titre de la page (Optionnel, ça fait plus "App") */}
            <Text style={styles.pageTitle}>Mes Interventions</Text>

            <FlatList
                data={interventions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                contentContainerStyle={{ paddingBottom: 20 }} // Espace en bas pour scroller
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={{ color: '#888', marginTop: 50 }}>Aucune intervention prévue.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 16 }, // Fond gris très clair
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginVertical: 20,
        marginLeft: 5
    },

    // --- STYLE DE LA CARTE ---
    card: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 12,
        padding: 12,
        alignItems: 'center',
        // Ombre douce (Shadow iOS + Android)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },

    // Bloc Date
    dateBox: {
        backgroundColor: '#F0F2F5',
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        minWidth: 55
    },
    dateDay: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    dateMonth: { fontSize: 12, color: '#666', textTransform: 'uppercase' },

    // Bloc Contenu
    contentBox: { flex: 1 },

    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        flex: 1, // Pour que le titre ne passe pas sur le badge
        marginRight: 8
    },

    // Badges (Statut)
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

    // Lignes d'infos (Client / Adresse)
    infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    subText: { fontSize: 13, color: '#666' },

    // Flèche
    arrowBox: { marginLeft: 8 },
});

export default InterventionScreen;