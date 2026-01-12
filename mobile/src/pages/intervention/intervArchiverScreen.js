import React, {useContext, useState, useEffect, useCallback} from "react";
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native";
import axios from "axios";
import { AuthContext } from "../../contextes/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import {useFocusEffect} from "@react-navigation/native";

function ArchiverScreen() {
    const { userToken } = useContext(AuthContext);
    const [interventions, setInterventions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const AfficherInterventionsArchivees = async () => {
        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/archived`;
        if (!userToken) return;

        try {
            const response = await axios.get(backendUrl, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setInterventions(response.data);
            setIsLoading(false);

            console.log(interventions)
        } catch (error) {
            console.error("Erreur API :", error);
            setIsLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            AfficherInterventionsArchivees();
        }, [userToken])
    );
    const renderInterventionCard = ({ item }) => {
        const date = item.date || item.date_debut;
        const formattedDate = date ? new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }) : "--/--/----";

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.cardTitle}>{item.titre || "Mission sans titre"}</Text>
                        <Text style={styles.dateText}>{formattedDate}</Text>
                    </View>
                    <View style={styles.archiveBadge}>
                        <Ionicons name="lock-closed" size={12} color="#888" />
                        <Text style={styles.archiveBadgeText}>ARCHIVÉ</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={16} color="#6A5AE0" style={styles.icon} />
                        <Text style={styles.infoText}>{item.nomClient || 'Client inconnu'}</Text>
                    </View>

                    <View style={styles.rapportBox}>
                        <Text style={styles.rapportLabel}>Compte-rendu final :</Text>
                        <Text style={styles.rapportText} numberOfLines={3}>
                            {item.rapport || 'Aucun rapport enregistré.'}
                        </Text>
                    </View>

                    {item.failure_reason && (
                        <View style={styles.failureBox}>
                            <Ionicons name="alert-circle" size={16} color="#E74C3C" style={styles.icon} />
                            <Text style={styles.failureText}>{item.failure_reason}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#6A5AE0" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Historique</Text>
                <Text style={styles.headerSubtitle}>{interventions.length} interventions archivées</Text>
            </View>

            {interventions.length > 0 ? (
                <FlatList
                    data={interventions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderInterventionCard}
                    contentContainerStyle={styles.flatListContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="archive-outline" size={64} color="#CCC" />
                    <Text style={styles.noDataText}>Aucune intervention archivée.</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5' },

    header: {
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
    headerSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },

    flatListContent: { padding: 16, paddingBottom: 120 },

    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    titleContainer: { flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
    dateText: { fontSize: 13, color: '#999', fontWeight: '500' },

    archiveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        marginLeft: 10,
    },
    archiveBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#888', marginLeft: 4 },

    cardBody: { gap: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: 8 },
    infoText: { fontSize: 15, color: '#444', fontWeight: '500' },

    rapportBox: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#6A5AE0',
    },
    rapportLabel: { fontSize: 12, fontWeight: 'bold', color: '#6A5AE0', marginBottom: 4 },
    rapportText: { fontSize: 14, color: '#666', lineHeight: 20 },

    failureBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        padding: 10,
        borderRadius: 10,
    },
    failureText: { flex: 1, fontSize: 13, color: '#E74C3C', fontWeight: '500' },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
    noDataText: { textAlign: 'center', marginTop: 20, color: '#999', fontSize: 16 },
});

export default ArchiverScreen;