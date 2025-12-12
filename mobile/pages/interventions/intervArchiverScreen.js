import { View, Text, FlatList, StyleSheet } from "react-native";
import axios from "axios";
import { AuthContext } from "../../contextes/AuthContexte";
import React, { useContext, useState, useEffect } from "react";
import {Ionicons} from "@expo/vector-icons";

function ArchiverScreen(){
    const { userToken } = useContext(AuthContext);
    const [interventions, setInterventions] = useState([]);

    const AfficherInterventionsArchivees = async () => {
        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/archived`;

        try {
            const response = await axios.get(backendUrl, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setInterventions(response.data);

        }
        catch (error) {
            console.error("Erreur API :", error);
        }
    }

    useEffect(() => {
        AfficherInterventionsArchivees();
    }, []);

    // 💡 Affichage pour vérifier
    const renderInterventionCard = ({ item }) => (
        <View style={styles.card}>

            {/* 1. Header de la Carte (Titre et Statut/Symbole) */}
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                    Intervention n°{item.id} - {item.titre}
                </Text>
                {/* Afficher le statut réel de l'archive (avec l'alerte si échec) */}
                <Text style={styles.archiveSymbol}>🔒 Archivée</Text>
            </View>

            {/* 2. Corps de la Carte (Infos principales) */}
            <View style={styles.cardBody}>
                <Text style={styles.clientLabel}>Client :</Text>
                <Text style={styles.clientValue}>{item.nomClient || 'Client inconnu'}</Text>

                {/* Un aperçu du rapport (limité à une ligne) */}
                <View style={styles.separator} />
                <Text style={styles.rapportPreview} numberOfLines={1} ellipsizeMode="tail">
                    Rapport : {item.rapport || 'Aucun rapport enregistré.'}
                </Text>

                {/* NOUVEAU BLOC : Afficher la raison de l'échec si elle existe */}
                {
                    item.failure_reason &&
                    <View style={styles.failurePreviewContainer}>
                        <Ionicons name="alert-circle-outline" size={16} style={styles.failureIcon} />
                        <Text style={styles.failurePreviewText} numberOfLines={1} ellipsizeMode="tail">
                            ÉCHEC : {item.failure_reason}
                        </Text>
                    </View>
                }

            </View>
        </View>
    );

    // 💡 Affichage
    return(
        <View style={styles.container}>
            {interventions.length > 0 ? (
                <FlatList
                    data={interventions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderInterventionCard}
                    contentContainerStyle={styles.flatListContent}
                />
            ) : (
                <Text style={styles.noDataText}>Aucune intervention archivée trouvée.</Text>
            )}
        </View>
    )
}

// Exemple de styles minimalistes pour la démonstration
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5', // Un fond légèrement gris
        paddingTop: 10,
    },
    flatListContent: {
        paddingHorizontal: 10, // Ajouter une marge horizontale à la liste
    },

    // --- Styles de la Carte (Card) ---
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        // Ombre pour effet de "flottement"
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },

    // --- Header ---
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        flexShrink: 1,
        marginRight: 10,
    },
    archiveSymbol: {
        fontSize: 12,
        fontWeight: '600',
        color: 'gray',
    },

    // --- Body ---
    cardBody: {
        paddingVertical: 5,
    },
    clientLabel: {
        fontSize: 12,
        color: '#666',
    },
    clientValue: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 5,
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 5,
    },
    rapportPreview: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#555',
    },

    // --- Footer ---
    cardFooter: {
        marginTop: 10,
        alignItems: 'flex-end',
    },
    viewDetailsText: {
        color: '#007AFF', // Couleur bleue typique pour un lien
        fontSize: 13,
        fontWeight: '500',
    },

    // --- No Data ---
    noDataText: {
        textAlign: 'center',
        marginTop: 50,
        color: 'gray',
    },
    failurePreviewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        padding: 5,
        borderRadius: 5,
        backgroundColor: '#FDE7E7', // Fond rouge très clair
        borderLeftWidth: 3,
        borderLeftColor: '#DC3545', // Ligne rouge
    },
    failureIcon: {
        color: '#DC3545', // Rouge
        marginRight: 5,
    },
    failurePreviewText: {
        color: '#DC3545',
        fontSize: 14,
        flexShrink: 1, // Permet au texte de se limiter à la ligne
    },
});
export default ArchiverScreen;