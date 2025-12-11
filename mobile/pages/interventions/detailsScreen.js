import React, { useContext, useEffect, useState } from 'react';
import {
    View, Text, ActivityIndicator, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Linking, Platform,
    TextInput, Alert
} from "react-native";
import axios from "axios";
import { AuthContext } from "../../contextes/AuthContexte";
import { Ionicons } from '@expo/vector-icons';

function DetailScreen({ route, navigation}) {
    const { interventionId } = route.params;
    const { userToken } = useContext(AuthContext);

    const [detailIntervention, setDetailIntervention] = useState(null);
    const [loading, setLoading] = useState(true);

    const [notesTechnicien, setNotesTechnicien] = useState('');
    const [rapport, setRapport] = useState('');
    const [isEditingRapport, setIsEditingRapport] = useState(false);


    const chargerDescription = async () => {
        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/${interventionId}`;
        try {
            const response = await axios.get(backendUrl, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            const data = response.data;

            setDetailIntervention(data);

            if (data.rapport) {
                setRapport(data.rapport);
            }
            if (data.notes_technicien) {
                setNotesTechnicien(data.notes_technicien);
            }

        } catch (e) {
            console.error("Erreur API :", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        chargerDescription();
    }, []);


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={{ marginTop: 10, color: '#666' }}>Chargement des détails...</Text>
            </View>
        );
    }

    if (!detailIntervention) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Impossible de charger les données.</Text>
            </View>
        );
    }

    const canEdit = detailIntervention.statut !== "archiver";

    const isRapportModifiable = (
        detailIntervention.statut === "prévu" || detailIntervention.statut === "en_cours" || isEditingRapport
    ) && canEdit;


    const modifierRapportNotes = async () => {

        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/${interventionId}/modifier`;

        try {
            await axios.patch(backendUrl, {
                rapport: rapport,
                notes_technicien: notesTechnicien,
            }, {
                headers: {Authorization: `Bearer ${userToken}`}
            })


            setDetailIntervention(prev => ({
                ...prev,
                notes_technicien: notesTechnicien,
                rapport : rapport,
            }));

            Alert.alert("Succès", "Modifications enregistrées.", [{ text: "OK" }]);

            if (isEditingRapport) {
                setIsEditingRapport(false);
            }

        } catch (e) {
            console.error("Erreur d'API/réseau lors de la sauvegarde :", e.response ? e.response.data : e.message);
            Alert.alert("Erreur", e.response?.data?.message || "Impossible d'enregistrer les modifications.");
        }
    };


    const terminerIntervention = async () =>{
        if (!rapport.trim()){
            alert("Veuillez écrire votre rapport")
            return;
        }

        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/${interventionId}`;

        try {
            await axios.put(backendUrl, { // <-- MÉTHODE CORRECTE : PUT
                statut: 'termine', // Valeur obligatoire pour cette route PUT
                notes_technicien: notesTechnicien,
                rapport: rapport
            }, {
                headers: {Authorization: `Bearer ${userToken}`}
            })

            setDetailIntervention(prev => ({
                ...prev,
                statut: 'termine',
                rapport: rapport,
                notes_technicien: notesTechnicien,
            }));

            Alert.alert("Succès","L'intervention est terminée",[{ text: "Super", onPress: () => navigation.goBack() }])

        }catch (e){
            console.error(e);
            Alert.alert("Erreur", "Impossible de marquer l'intervention comme terminée.");
        }
    }


    const archiverInterv = async () => {
        if (detailIntervention?.statut === "archiver") {
            Alert.alert("Action impossible", "Cette intervention est déjà archivée.");
            return;
        }

        let proceedWithArchive = false;

        if (Platform.OS === 'web') {
            proceedWithArchive = window.confirm("Êtes-vous sûr de vouloir archiver cette intervention ?");
        } else {
            proceedWithArchive = await new Promise((resolve) => {
                Alert.alert("Confirmation", "Êtes-vous sûr de vouloir archiver cette intervention ?",
                    [{ text: "Annuler", style: "cancel", onPress: () => resolve(false) },
                        { text: "Archiver", style: "destructive", onPress: () => resolve(true) }]
                );
            });
        }

        if (!proceedWithArchive) {
            return;
        }

        const backUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/${interventionId}/archive`;

        try {
            await axios.patch(backUrl, {}, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setDetailIntervention({
                ...detailIntervention,
                statut: 'archiver'
            });

            Alert.alert("Succès", "Archivage de l'intervention réussi", [{ text: "OK", onPress: () => navigation.goBack() }]);
        } catch (e) {
            console.error("Erreur lors de l'archivage :", e.response?.data || e.message);
            Alert.alert("Erreur", "Impossible d'archiver l'intervention.");
        }
    }


    const ouvrirGPS = () => {
        const adresse = detailIntervention?.adresse;

        if (!adresse) {
            alert("Pas d'adresse disponible.");
            return;
        }
        const query = encodeURIComponent(adresse);
        const url = Platform.select({
            ios: `http://maps.apple.com/?q=${query}`,
            android: `geo:0,0?q=${query}`,
            default: `http://googleusercontent.com/maps.google.com/?q=${query}`,
        });

        Linking.openURL(url).catch(err => console.error('An error occurred', err));
    };


    const getStatusStyle = (status) => {
        switch (status) {
            case 'en_cours': return { bg: '#FFF4E5', text: '#FF9800', label: 'En Cours' };
            case 'termine': case 'terminé': return { bg: '#E8F5E9', text: '#4CAF50', label: 'Terminé' };
            case 'prevu': case 'prévu': return { bg: '#E3F2FD', text: '#2196F3', label: 'Prévu' };
            case 'archiver': return { bg: '#F5F5F5', text: '#9E9E9E', label: 'Archivée' };
            default: return { bg: '#F5F5F5', text: '#9E9E9E', label: status || 'Inconnu' };
        }
    };

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

                {/* --- BLOC 2 : INFOS CLÉS (Date, Client, Adresse, Description Mission) --- */}
                <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>INFORMATIONS</Text>
                </View>

                <View style={styles.card}>
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
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={22} color="#007AFF" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.label}>Client</Text>
                            <Text style={styles.value}>{detailIntervention.nomClient || detailIntervention.client || "Non spécifié"}</Text>
                        </View>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={22} color="#007AFF" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.label}>Adresse</Text>
                            <Text style={styles.value}>{detailIntervention.adresse || "Aucune adresse"}</Text>
                        </View>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.infoRow}>
                        <Ionicons name="document-text-outline" size={22} color="#007AFF" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.label}>Description de la mission</Text>
                            <Text style={styles.value}>{detailIntervention.description || "Aucune description"}</Text>
                        </View>
                    </View>
                </View>

                {/* --- BOUTON GPS (Reste en place) --- */}
                <TouchableOpacity style={styles.gpsButton} onPress={ouvrirGPS}>
                    <Ionicons name="navigate" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.gpsButtonText}>Y ALLER (GPS)</Text>
                </TouchableOpacity>

                {/* --- BLOC NOTES TECHNICIEN (Modifiable sauf si archivé) --- */}
                <View style={styles.sectionTitleContainer}>
                    <Ionicons name="clipboard-outline" size={13} color="#888" style={{ marginRight: 5 }} />
                    <Text style={styles.sectionTitle}>NOTES DU TECHNICIEN</Text>
                </View>

                {/* Le corps de la Note (la carte) */}
                <View style={styles.card}>
                    {canEdit ? (
                        <TextInput
                            style={styles.inputRapport}
                            placeholder="Vos observations durant la mission..."
                            placeholderTextColor="#999"
                            multiline={true}
                            numberOfLines={4}
                            value={notesTechnicien}
                            onChangeText={setNotesTechnicien}
                        />
                    ) : (
                        <Text style={styles.descriptionText}>
                            {notesTechnicien || "Aucune note saisie."}
                        </Text>
                    )}
                </View>

                {/* --- BOUTON SAUVEGARDER LES NOTES --- */}
                {/* Apparaît juste après la carte si le champ est modifiable (canEdit) ET si le rapport n'est pas en mode édition */}
                {canEdit && !isEditingRapport && (
                    <TouchableOpacity
                        style={[styles.validateButton, { marginBottom: 20, backgroundColor: '#6C757D' }]}
                        onPress={modifierRapportNotes}
                    >
                        <Ionicons name="save-outline" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.validateText}>SAUVEGARDER LES NOTES</Text>
                    </TouchableOpacity>
                )}





                {/* --- BLOC RAPPORT DE CLÔTURE --- */}
                {(detailIntervention.statut === 'termine' || detailIntervention.rapport || isRapportModifiable) && (
                    <View style={styles.successCard}>
                        <View style={styles.successHeader}>
                            <Ionicons name="document-text-outline" size={20} color="#2E7D32" />
                            <Text style={styles.successTitle}>RAPPORT DE CLÔTURE</Text>
                        </View>

                        {isRapportModifiable ? (
                            <TextInput
                                style={styles.inputRapport}
                                placeholder="Rédigez le travail effectué (ex: Box changée...)"
                                placeholderTextColor="#999"
                                multiline={true}
                                numberOfLines={4}
                                value={rapport}
                                onChangeText={setRapport}
                            />
                        ) : (
                            <Text style={styles.successText}>
                                {rapport || "Aucun rapport saisi."}
                            </Text>
                        )}
                    </View>
                )}


                {/* --- BOUTONS D'ACTIONS (EN BAS) --- */}

                {/* 1. BOUTON DE SAUVEGARDE GÉNÉRALE (Modifie Notes et/ou Rapport) */}
                {canEdit && (isRapportModifiable || detailIntervention.statut !== 'termine') && (
                    <TouchableOpacity
                        style={[styles.validateButton, { backgroundColor: '#FF9800' }]}
                        onPress={modifierRapportNotes}
                    >
                        <Ionicons name="save-outline" size={24} color="white" />
                        <Text style={styles.validateText}> SAUVEGARDER LES MODIFICATIONS</Text>
                    </TouchableOpacity>
                )}


                {/* 2. BOUTON TERMINER L'INTERVENTION (Passe à statut 'termine') */}
                {['en_cours', 'prévu'].includes(detailIntervention.statut) && canEdit && (
                    <TouchableOpacity
                        style={[styles.validateButton, { marginTop: 15 }]}
                        onPress={terminerIntervention}
                    >
                        <Ionicons name="checkmark-done-circle" size={24} color="white" />
                        <Text style={styles.validateText}> MARQUER COMME TERMINÉ</Text>
                    </TouchableOpacity>
                )}


                {/* 3. BOUTON MODIFIER LE RAPPORT (Passe en mode édition après 'termine') */}
                {detailIntervention.statut === 'termine' && canEdit && !isEditingRapport && (
                    <TouchableOpacity
                        style={[styles.validateButton, { marginTop: 15, backgroundColor: '#2196F3' }]}
                        onPress={() => setIsEditingRapport(true)}
                    >
                        <Ionicons name="create-outline" size={24} color="white" />
                        <Text style={styles.validateText}> MODIFIER LE RAPPORT</Text>
                    </TouchableOpacity>
                )}

                {/* 4. BOUTON ARCHIVER */}
                { detailIntervention.statut === 'termine' && (
                    <TouchableOpacity
                        style={[styles.validateButton, styles.archiveButton, {marginTop: 15}]}
                        onPress={archiverInterv}
                    >
                        <Ionicons name="archive-outline" size={24} color="white" />
                        <Text style={styles.validateText}> ARCHIVER</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20 , paddingBottom: 100},

    headerCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        marginBottom: 25,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', flex: 1, marginRight: 10 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    statusText: { fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },

    sectionTitleContainer: { marginBottom: 10, marginLeft: 5, flexDirection: 'row', alignItems: 'center' },
    sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#888', letterSpacing: 1, textTransform: 'uppercase' },

    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#EEE'
    },

    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    infoTextContainer: { marginLeft: 15, flex: 1 },
    label: { fontSize: 12, color: '#999', marginBottom: 2 },
    value: { fontSize: 16, color: '#333', fontWeight: '500' },
    separator: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 5, marginLeft: 37 },

    descriptionText: { fontSize: 16, color: '#444', lineHeight: 24 },

    gpsButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 25,
        shadowColor: "#007AFF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
    },
    gpsButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 },


    inputRapport: {
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: 16,
        color: '#333',
        padding: 0,
    },
    validateButton: {
        backgroundColor: '#2ECC71',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 12,
        shadowColor: "#2ECC71", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 6,
    },
    validateText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
        marginLeft: 10,
    },

    successCard: {
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    successHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(46, 125, 50, 0.1)',
        paddingBottom: 8
    },
    successTitle: {
        color: '#2E7D32',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    successText: {
        color: '#1B5E20',
        fontSize: 16,
        lineHeight: 24,
    },
    archiveButton: {
        backgroundColor: '#E67E22',
        marginTop: 15,
        shadowColor: "#E67E22",
        marginBottom: 40,
    },
});

export default DetailScreen;