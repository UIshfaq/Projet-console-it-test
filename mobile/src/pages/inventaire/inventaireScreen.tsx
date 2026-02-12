import React, { useContext, useState, useEffect } from 'react';
import {
    View, Text, FlatList, ActivityIndicator, StyleSheet,
    Alert, SafeAreaView, TextInput, RefreshControl
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contextes/AuthContext';

// 1. Définition du type
interface InventoryItem {
    id: number;
    name: string;
    reference: string;
    stock_quantity: number;
}

export default function InventaireScreen() {
    const { userToken } = useContext(AuthContext);

    // États
    const [materials, setMaterials] = useState<InventoryItem[]>([]);
    const [filteredMaterials, setFilteredMaterials] = useState<InventoryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // 2. Fonction de récupération (API)
    const fetchInventaire = async () => {
        // ⚠️ Utilise la route globale des matériaux
        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/materials`;

        try {
            const response = await axios.get<InventoryItem[]>(backendUrl, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            setMaterials(response.data);
            setFilteredMaterials(response.data); // Init du filtre
        } catch (error) {
            console.error("Erreur API :", error);
            // On évite l'alerte bloquante à chaque refresh, juste un log suffira souvent
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Chargement initial
    useEffect(() => {
        if (userToken) {
            fetchInventaire();
        }
    }, [userToken]);

    // 3. Gestion de la recherche
    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredMaterials(materials);
        } else {
            const lowerText = text.toLowerCase();
            const filtered = materials.filter(item =>
                item.name.toLowerCase().includes(lowerText) ||
                (item.reference && item.reference.toLowerCase().includes(lowerText))
            );
            setFilteredMaterials(filtered);
        }
    };

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchInventaire();
    };

    // 4. Rendu d'une ligne
    const renderItem = ({ item }: { item: InventoryItem }) => {
        // Logique visuelle : Stock critique (< 10)
        const isLowStock = item.stock_quantity < 10;

        return (
            <View style={styles.card}>
                <View style={styles.iconBox}>
                    <Ionicons name="cube-outline" size={24} color="#6A5AE0" />
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemRef}>Réf: {item.reference || 'N/A'}</Text>
                </View>

                <View style={[styles.stockContainer, isLowStock && styles.stockContainerAlert]}>
                    <Text style={[styles.stockQuantity, isLowStock && styles.stockQuantityAlert]}>
                        {item.stock_quantity}
                    </Text>
                    <Text style={[styles.stockLabel, isLowStock && styles.stockLabelAlert]}>
                        en stock
                    </Text>
                </View>
            </View>
        );
    };

    if (isLoading && !isRefreshing) {
        return (
            <View style={styles.centerLoading}>
                <ActivityIndicator size="large" color="#6A5AE0" />
            </View>
        );
    }

    // 5. Affichage principal
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Stock Dépôt</Text>

                {/* Barre de Recherche */}
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#999" style={{ marginRight: 10 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un matériel..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholderTextColor="#999"
                    />
                    {searchQuery.length > 0 && (
                        <Ionicons name="close-circle" size={20} color="#999" onPress={() => handleSearch('')} />
                    )}
                </View>
            </View>

            <FlatList
                data={filteredMaterials}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#6A5AE0']} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="file-tray-outline" size={50} color="#ccc" />
                        <Text style={styles.emptyText}>Aucun matériel trouvé.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: { padding: 20, backgroundColor: 'white', paddingBottom: 15 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 15 },

    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F0F2F5', borderRadius: 12, paddingHorizontal: 15, height: 45
    },
    searchInput: { flex: 1, fontSize: 16, color: '#333' },

    listContent: { padding: 16 },

    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconBox: {
        width: 45, height: 45, borderRadius: 12,
        backgroundColor: '#F3F0FF',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 15
    },
    infoContainer: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '600', color: '#2C3E50' },
    itemRef: { fontSize: 12, color: '#7F8C8D', marginTop: 4 },

    // Stock Normal (Vert)
    stockContainer: {
        alignItems: 'center',
        backgroundColor: '#E8F6F3',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        minWidth: 70
    },
    stockQuantity: { fontSize: 18, fontWeight: 'bold', color: '#16A085' },
    stockLabel: { fontSize: 10, color: '#16A085' },

    // Stock Alerte (Rouge)
    stockContainerAlert: { backgroundColor: '#FFEBEE' },
    stockQuantityAlert: { color: '#D32F2F' },
    stockLabelAlert: { color: '#D32F2F' },

    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#999', marginTop: 10, fontSize: 16 },
});