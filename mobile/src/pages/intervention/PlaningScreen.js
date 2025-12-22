import React, { useState, useContext, useCallback, useLayoutEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import axios from "axios";
import { AuthContext } from '../../contextes/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

function InterventionScreen({ navigation }) {
    const [interventions, setInterventions] = useState([]);
    const [filteredInterventions, setFilteredInterventions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { userToken } = useContext(AuthContext);

    const afficherInterventions = async () => {
        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/`;
        if (!userToken) return;

        try {
            const response = await axios.get(backendUrl, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setInterventions(response.data);
            setFilteredInterventions(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Erreur API :", error.response?.data || error.message);
            setIsLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            afficherInterventions();
        }, [userToken])
    );

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text === '') {
            setFilteredInterventions(interventions);
        } else {
            const filtered = interventions.filter(item =>
                (item.titre && item.titre.toLowerCase().includes(text.toLowerCase())) ||
                (item.nomClient && item.nomClient.toLowerCase().includes(text.toLowerCase())) ||
                (item.adresse && item.adresse.toLowerCase().includes(text.toLowerCase()))
            );
            setFilteredInterventions(filtered);
        }
    };

    const getDateParts = (dateString) => {
        if (!dateString) return { day: '--', month: '--' };
        const date = new Date(dateString);
        const day = date.toLocaleDateString('fr-FR', { day: '2-digit' });
        const month = date.toLocaleDateString('fr-FR', { month: 'short' });
        return { day, month: month.replace('.', '').toUpperCase() };
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'en_cours': return { bg: '#FFF4E5', text: '#FF9800', label: 'En Cours', icon: 'time-outline' };
            case 'termine':
            case 'terminé': return { bg: '#E8F5E9', text: '#4CAF50', label: 'Terminé', icon: 'checkmark-circle-outline' };
            case 'prevu':
            case 'prévu': return { bg: '#E3F2FD', text: '#2196F3', label: 'Prévu', icon: 'calendar-outline' };
            case 'echec': return { bg: '#FFEBEE', text: '#F44336', label: 'Échec', icon: 'alert-circle-outline' };
            default: return { bg: '#F5F5F5', text: '#9E9E9E', label: status, icon: 'help-circle-outline' };
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'Mes Missions',
        });
    }, [navigation]);

    const renderItem = ({ item }) => {
        const { day, month } = getDateParts(item.date || item.date_debut);
        const statusStyle = getStatusStyle(item.statut);

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Detail', { interventionId: item.id })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateDay}>{day}</Text>
                        <Text style={styles.dateMonth}>{month}</Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.missionTitle} numberOfLines={1}>{item.titre || "Mission sans titre"}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                            <Ionicons name={statusStyle.icon} size={12} color={statusStyle.text} style={{ marginRight: 4 }} />
                            <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="person" size={14} color="#6A5AE0" />
                        </View>
                        <Text style={styles.infoText} numberOfLines={1}>{item.nomClient || item.client || "Client non spécifié"}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="location" size={14} color="#6A5AE0" />
                        </View>
                        <Text style={styles.infoText} numberOfLines={1}>{item.adresse || "Pas d'adresse spécifiée"}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.footerTime}>Prévu à 09:30</Text>
                    <Ionicons name="chevron-forward-circle" size={24} color="#6A5AE0" />
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#6A5AE0" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchBarContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher une mission..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>

            <FlatList
                data={filteredInterventions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="clipboard-outline" size={64} color="#CCC" />
                        <Text style={styles.emptyText}>Aucune mission trouvée.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginVertical: 15,
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 50,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16, color: '#1A1A1A' },

    listContent: { paddingHorizontal: 16, paddingBottom: 120 },

    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        marginBottom: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    dateBadge: {
        backgroundColor: '#F0EFFF',
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 55,
    },
    dateDay: { fontSize: 20, fontWeight: 'bold', color: '#6A5AE0' },
    dateMonth: { fontSize: 10, fontWeight: 'bold', color: '#6A5AE0', marginTop: -2 },

    headerInfo: { flex: 1, marginLeft: 15 },
    missionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 6 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

    cardBody: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F0F0F0',
        paddingVertical: 12,
        marginBottom: 12,
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    iconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F0EFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    infoText: { fontSize: 14, color: '#666', flex: 1 },

    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerTime: { fontSize: 13, color: '#999', fontWeight: '600' },

    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#999', marginTop: 15, fontSize: 16 },
});

export default InterventionScreen;