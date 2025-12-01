import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Linking, Platform } from "react-native";
import axios from "axios";
import { AuthContext } from "../../contextes/AuthContexte";
import { Ionicons } from '@expo/vector-icons'; // On ajoute les icônes

function DetailScreen({ route }) {
    // On récupère l'objet 'intervention' passé par la liste
    const { intervention } = route.params;

    const [detailIntervention, setDetailIntervention] = useState(null);
    const [loading, setLoading] = useState(true);
    const { userToken } = useContext(AuthContext);

    const chargerDescription = async () => {
        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/${intervention.id}`;
        try {
            const response = await axios.get(backendUrl, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setDetailIntervention(response.data);
            setLoading(false);
        } catch (e) {
            console.error("Erreur API :", e);
            setLoading(false);
        }
    }

    useEffect(() => {
        chargerDescription();
    }, []);


    const ouvrirGPS = () => {
        const adresse = detailIntervention?.adresse;

        if (!adresse) {
            alert("Pas d'adresse disponible.");
            return;
        }

        // On encode l'adresse (transforme les espaces en %20, etc.)
        const query = encodeURIComponent(adresse);

        // Ce lien magique fonctionne sur :
        // 1. Le Web (Ouvre un nouvel onglet Google Maps)
        // 2. Android (Ouvre l'appli Maps)
        // 3. iOS (Ouvre l'appli Maps ou le navigateur)
        const url = `https://www.google.com/maps/search/?api=1&query=${query}`;

        Linking.openURL(url);
    };

    // Gestion des couleurs du statut (Même logique que la liste pour être cohérent)
    const getStatusStyle = (status) => {
        switch (status) {
            case 'en_cours': return { bg: '#FFF4E5', text: '#FF9800', label: 'En Cours' };
            case 'termine': case 'terminé': return { bg: '#E8F5E9', text: '#4CAF50', label: 'Terminé' };
            case 'prevu': case 'prévu': return { bg: '#E3F2FD', text: '#2196F3', label: 'Prévu' };
            default: return { bg: '#F5F5F5', text: '#9E9E9E', label: status || 'Inconnu' };
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={{ marginTop: 10, color: '#666' }}>Chargement des détails...</Text>
            </View>
        );
    }

    // Si jamais l'API échoue, on évite le crash
    if (!detailIntervention) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Impossible de charger les données.</Text>
            </View>
        );
    }

    const statusStyle = getStatusStyle(detailIntervention.statut);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* --- BLOC 1 : EN-TÊTE --- */}
                <View style={styles.headerCard}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>{detailIntervention.titre}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                            <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                {statusStyle.label}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* --- BLOC 2 : INFOS CLÉS --- */}
                <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>INFORMATIONS</Text>
                </View>

                <View style={styles.card}>
                    {/* Date */}
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={22} color="#007AFF" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.label}>Date d'intervention</Text>
                            <Text style={styles.value}>
                                {new Date(detailIntervention.date || detailIntervention.date_debut).toLocaleDateString('fr-FR', { dateStyle: 'full' })}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.separator} />

                    {/* Client */}
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={22} color="#007AFF" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.label}>Client</Text>
                            <Text style={styles.value}>{detailIntervention.nomClient || detailIntervention.client || "Non spécifié"}</Text>
                        </View>
                    </View>

                    <View style={styles.separator} />

                    {/* Adresse */}
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={22} color="#007AFF" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.label}>Adresse</Text>
                            <Text style={styles.value}>{detailIntervention.adresse || "Aucune adresse"}</Text>
                        </View>
                    </View>
                </View>

                {/* --- BOUTON GPS --- */}
                <TouchableOpacity style={styles.gpsButton} onPress={ouvrirGPS}>
                    <Ionicons name="navigate" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.gpsButtonText}>Y ALLER (GPS)</Text>
                </TouchableOpacity>

                {/* --- BLOC 3 : MISSION --- */}
                <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>MISSION & NOTES</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.descriptionText}>
                        {detailIntervention.description || "Aucune note particulière pour cette intervention."}
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' }, // Fond gris clair pro
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20 },

    // En-tête
    headerCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        marginBottom: 25,
        // Ombre
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', flex: 1, marginRight: 10 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    statusText: { fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },

    // Titres de section
    sectionTitleContainer: { marginBottom: 10, marginLeft: 5 },
    sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#888', letterSpacing: 1, textTransform: 'uppercase' },

    // Cartes standard
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#EEE'
    },

    // Lignes d'infos
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    infoTextContainer: { marginLeft: 15, flex: 1 },
    label: { fontSize: 12, color: '#999', marginBottom: 2 },
    value: { fontSize: 16, color: '#333', fontWeight: '500' },
    separator: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 5, marginLeft: 37 },

    // Description
    descriptionText: { fontSize: 16, color: '#444', lineHeight: 24 },

    // Bouton GPS
    gpsButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 25,
        // Ombre bleue
        shadowColor: "#007AFF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
    },
    gpsButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }
});

export default DetailScreen;