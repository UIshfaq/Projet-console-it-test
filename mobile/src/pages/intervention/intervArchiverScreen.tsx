import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, FlatList, StyleSheet, ActivityIndicator,
    TouchableOpacity, SafeAreaView, RefreshControl
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';

// Imports Types & Contextes
import {RootStackParamList, TabParamList} from '../../types/Navigation';
import { AuthContext } from '../../contextes/AuthContext';
import { Intervention } from '../../types/Intervention';

type Props = StackScreenProps<RootStackParamList & TabParamList, 'Archives'>;


export default function InterventionArchiverScreen({ navigation }: Props) {
    const { userToken } = useContext(AuthContext);

    const [archives, setArchives] = useState<Intervention[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const fetchArchives = async () => {
        try {

            const url = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/archived`;

            const response = await axios.get<Intervention[]>(url, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            setArchives(response.data);
        } catch (error) {
            console.error("Erreur récupération archives:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchArchives();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchArchives();
    };

    // Rendu d'une carte d'archive
    const renderItem = ({ item }: { item: Intervention }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Detail', { interventionId: item.id })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>ARCHIVÉ</Text>
                </View>
            </View>

            <Text style={styles.title}>{item.titre}</Text>
            <Text style={styles.address} numberOfLines={1}>
                <Ionicons name="location-sharp" size={14} color="#7F8C8D" /> {item.adresse}
            </Text>

            <View style={styles.footer}>
                <Text style={styles.client}>Client : {item.nomClient}</Text>
                <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#607D8B" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Historique des Missions</Text>
                <Text style={styles.headerSubtitle}>
                    {archives.length} mission{archives.length > 1 ? 's' : ''} archivée{archives.length > 1 ? 's' : ''}
                </Text>
            </View>

            <FlatList
                data={archives}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#607D8B']} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="file-tray-outline" size={60} color="#CFD8DC" />
                        <Text style={styles.emptyText}>Aucune archive pour le moment.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' }, // Fond gris très clair
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    headerContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#34495E' },
    headerSubtitle: { fontSize: 14, color: '#7F8C8D', marginTop: 5 },

    listContent: { padding: 15 },

    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 5,
        borderLeftColor: '#BDC3C7', // Bordure grise pour signifier "passé"
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    date: { fontSize: 12, fontWeight: '600', color: '#95A5A6' },
    badge: { backgroundColor: '#ECEFF1', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    badgeText: { fontSize: 10, fontWeight: 'bold', color: '#607D8B' },

    title: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50', marginBottom: 4 },
    address: { fontSize: 13, color: '#7F8C8D', marginBottom: 12 },

    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F3F4', paddingTop: 10 },
    client: { fontSize: 12, color: '#34495E', fontWeight: '500' },

    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#B0BEC5', fontSize: 16, marginTop: 10 }
});