import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../contextes/AuthContext';

export default function InventaireScreen() {
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const { userToken } = useContext(AuthContext);

    const fetchInventaire = async () => {
        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/inventaires/`;

        try {
            const response = await axios.get(backendUrl, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            setMaterials(response.data);
        } catch (error) {
            console.error("Erreur API :", error);
            Alert.alert("Erreur", "Impossible de charger le stock.");
        } finally {
            setIsLoading(false);
        }
    };

    // 3. useEffect : Se lance une seule fois au montage du composant
    useEffect(() => {
        if (userToken) {
            fetchInventaire();
        }
    }, [userToken]);


    // 4. Le rendu d'un élément de la liste (une ligne du tableau)
    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.infoContainer}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemRef}>Réf: {item.reference || 'N/A'}</Text>
            </View>
            <View style={styles.stockContainer}>
                <Text style={styles.stockQuantity}>{item.stock_quantity}</Text>
                <Text style={styles.stockLabel}>en stock</Text>
            </View>
        </View>
    );

    // 5. Affichage principal
    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Stock Dépôt</Text>

            {isLoading ? (
                <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={materials}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    onRefresh={fetchInventaire}
                    refreshing={isLoading}
                    ListEmptyComponent={<Text style={styles.emptyText}>Aucun matériel trouvé.</Text>}
                />
            )}
        </View>
    );
}

// 6. Styles simples et propres
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA', // Gris très clair
        padding: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row', // Pour aligner Nom à gauche et Stock à droite
        justifyContent: 'space-between',
        alignItems: 'center',
        // Ombre légère (Shadow)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoContainer: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
    },
    itemRef: {
        fontSize: 12,
        color: '#7F8C8D',
        marginTop: 4,
    },
    stockContainer: {
        alignItems: 'center',
        backgroundColor: '#E8F6F3', // Fond vert très clair
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    stockQuantity: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#16A085', // Vert foncé
    },
    stockLabel: {
        fontSize: 10,
        color: '#16A085',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
    },
});