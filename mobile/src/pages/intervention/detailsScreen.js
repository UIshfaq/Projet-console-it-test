import React, { useContext, useEffect, useState } from 'react';
import {
    View, Text, ActivityIndicator, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Linking, Platform,
    TextInput, Alert, Modal, StatusBar, KeyboardAvoidingView
} from "react-native";
import axios from "axios";
import { AuthContext } from "../../contextes/AuthContext";
import { Ionicons } from '@expo/vector-icons';

function DetailScreen({ route, navigation }) {
    const { interventionId } = route.params;
    const { userToken } = useContext(AuthContext);

    const [detailIntervention, setDetailIntervention] = useState(null);
    const [loading, setLoading] = useState(true);

    const [notesTechnicien, setNotesTechnicien] = useState('');
    const [rapport, setRapport] = useState('');
    const [isEditingRapport, setIsEditingRapport] = useState(false);
    const [isClotureModalVisible, setIsClotureModalVisible] = useState(false);
    const [echecRaison, setEchecRaison] = useState('');
    const [isFailing, setIsFailing] = useState(false);

    const chargerDescription = async () => {
        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/${interventionId}`;
        try {
            const response = await axios.get(backendUrl, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            const data = response.data;
            setDetailIntervention(data);
            if (data.rapport) setRapport(data.rapport);
            if (data.notes_technicien) setNotesTechnicien(data.notes_technicien);
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
                <ActivityIndicator size="large" color="#6A5AE0" />
                <Text style={styles.loadingText}>Chargement des détails...</Text>
            </View>
        );
    }

    if (!detailIntervention) {
        return (
            <View style={styles.loadingContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#FF5252" />
                <Text style={styles.errorText}>Impossible de charger les données.</Text>
            </View>
        );
    }

    const isFinalStatus = ['archiver', 'termine', 'echec'].includes(detailIntervention.statut);
    const canEdit = !isFinalStatus;
    const isRapportModifiable = (detailIntervention.statut === "prévu" || detailIntervention.statut === "en_cours") || isEditingRapport;

    const modifierRapportNotes = async () => {
        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/${interventionId}/modifier`;
        try {
            await axios.patch(backendUrl, {
                rapport: rapport,
                notes_technicien: notesTechnicien,
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setDetailIntervention(prev => ({
                ...prev,
                notes_technicien: notesTechnicien,
                rapport: rapport,
            }));
            Alert.alert("Succès", "Modifications enregistrées.");
            if (isEditingRapport) setIsEditingRapport(false);
        } catch (e) {
            console.error("Erreur sauvegarde :", e.response?.data || e.message);
            Alert.alert("Erreur", "Impossible d'enregistrer les modifications.");
        }
    };

    const cloturerInterv = async (finalStatut) => {
        if (!rapport.trim()) {
            Alert.alert("Action requise", "Veuillez entrer votre rapport avant de clôturer.");
            return;
        }

        let failureReasonToSend = null;
        if (finalStatut === 'echec') {
            if (!echecRaison || echecRaison.trim().length < 10) {
                Alert.alert("Justification requise", "Veuillez détailler la raison de l'échec (min 10 car.).");
                return;
            }
            failureReasonToSend = echecRaison;
        }

        try {
            const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/${interventionId}`;
            await axios.put(backendUrl, {
                statut: finalStatut,
                notes_technicien: notesTechnicien,
                rapport: rapport,
                failure_reason: failureReasonToSend,
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            setDetailIntervention(prev => ({
                ...prev,
                statut: finalStatut,
                rapport: rapport,
                notes_technicien: notesTechnicien,
                failure_reason: failureReasonToSend
            }));

            setIsClotureModalVisible(false);
            setIsFailing(false);
            setEchecRaison('');
            Alert.alert("Mission Terminée", `Statut : ${finalStatut}`, [{ text: "OK", onPress: () => navigation.goBack() }]);
        } catch (e) {
            Alert.alert("Erreur", "Impossible de finaliser la clôture.");
        }
    }

    const archiverInterv = async () => {
        if (detailIntervention?.statut === "archiver") {
            return;
        }

        const proceed = async () => {
            const backUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/${interventionId}/archive`;

            try {
                await axios.patch(backUrl, {}, {
                    headers: { Authorization: `Bearer ${userToken}` },
                    timeout: 8000
                });

                setDetailIntervention(prev => ({ ...prev, statut: 'archiver' }));

                if (Platform.OS === 'web') {
                    alert("Succès : L'intervention a été archivée.");
                    navigation.goBack();
                } else {
                    Alert.alert("Succès", "L'intervention a été archivée.", [
                        { text: "OK", onPress: () => navigation.goBack() }
                    ]);
                }
            } catch (e) {
                if (Platform.OS === 'web') {
                    alert("Erreur : Impossible d'archiver.");
                } else {
                    Alert.alert("Erreur", "Impossible d'archiver cette intervention.");
                }
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Voulez-vous vraiment archiver cette intervention ?")) {
                proceed();
            }
        } else {
            Alert.alert(
                "Confirmation",
                "Voulez-vous vraiment archiver cette intervention ?",
                [
                    { text: "Annuler", style: "cancel" },
                    { text: "Archiver", style: "destructive", onPress: proceed }
                ]
            );
        }
    }

    const ouvrirGPS = () => {
        const adresse = detailIntervention?.adresse;
        if (!adresse) return;
        const query = encodeURIComponent(adresse);
        const url = Platform.select({
            ios: `http://maps.apple.com/?q=${query}`,
            android: `geo:0,0?q=${query}`,
            default: `https://www.google.com/maps/search/?api=1&query=${query}`,
        });
        Linking.openURL(url);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'en_cours': return { bg: '#FFF4E5', text: '#FF9800', label: 'En Cours' };
            case 'termine': case 'terminé': return { bg: '#E8F5E9', text: '#4CAF50', label: 'Terminé' };
            case 'prevu': case 'prévu': return { bg: '#E3F2FD', text: '#2196F3', label: 'Prévu' };
            case 'archiver': return { bg: '#F5F5F5', text: '#9E9E9E', label: 'Archivée' };
            case 'echec': return { bg: '#FFEBEE', text: '#F44336', label: 'Échec' };
            default: return { bg: '#F5F5F5', text: '#9E9E9E', label: status || 'Inconnu' };
        }
    };

    const statusStyle = getStatusStyle(detailIntervention.statut);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                    {/* --- HEADER --- */}
                    <View style={styles.headerCard}>
                        <View style={styles.headerInfo}>
                            <Text style={styles.title}>{detailIntervention.titre}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
                            </View>
                        </View>
                    </View>

                    {/* --- INFO SECTION --- */}
                    <Text style={styles.sectionTitle}>DÉTAILS DE LA MISSION</Text>
                    <View style={styles.infoGrid}>
                        <InfoRow icon="calendar" label="Date" value={new Date(detailIntervention.date || detailIntervention.date_debut).toLocaleDateString('fr-FR', { dateStyle: 'medium' })} />
                        <InfoRow icon="person" label="Client" value={detailIntervention.nomClient || detailIntervention.client || "Client inconnu"} />
                        <InfoRow icon="location" label="Adresse" value={detailIntervention.adresse || "Non spécifiée"} isAddress onPress={ouvrirGPS} />
                        <InfoRow icon="information-circle" label="Description" value={detailIntervention.description || "Aucune description fournie"} />
                    </View>

                    {/* --- ACTION GPS --- */}
                    <TouchableOpacity style={styles.gpsButton} onPress={ouvrirGPS}>
                        <Ionicons name="navigate" size={20} color="white" />
                        <Text style={styles.gpsButtonText}>DÉMARRER LE TRAJET (GPS)</Text>
                    </TouchableOpacity>

                    {/* --- NOTES TECHNICIEN --- */}
                    <Text style={styles.sectionTitle}>COMPTE-RENDU & NOTES</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Notes internes (Technicien)</Text>
                        {canEdit ? (
                            <TextInput
                                style={styles.textArea}
                                placeholder="Observations au cours de l'intervention..."
                                placeholderTextColor="#999"
                                multiline
                                value={notesTechnicien}
                                onChangeText={setNotesTechnicien}
                            />
                        ) : (
                            <View style={styles.readOnlyBox}>
                                <Text style={styles.readOnlyText}>{notesTechnicien || "Aucune note interne."}</Text>
                            </View>
                        )}
                    </View>

                    {/* --- RAPPORT CLIENT --- */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Rapport de clôture (Client)</Text>
                        {isRapportModifiable ? (
                            <TextInput
                                style={[styles.textArea, { borderColor: '#4CAF50' }]}
                                placeholder="Rédigez le rapport pour le client..."
                                placeholderTextColor="#999"
                                multiline
                                value={rapport}
                                onChangeText={setRapport}
                            />
                        ) : (
                            <View style={[styles.readOnlyBox, { backgroundColor: '#E8F5E9' }]}>
                                <Text style={[styles.readOnlyText, { color: '#2E7D32' }]}>{rapport || "Pas encore de rapport rédigé."}</Text>
                            </View>
                        )}
                    </View>

                    {/* --- RAISON ECHEC --- */}
                    {detailIntervention.statut === 'echec' && detailIntervention.failure_reason && (
                        <View style={styles.failureBox}>
                            <Ionicons name="warning" size={20} color="#F44336" />
                            <View style={{ marginLeft: 10 }}>
                                <Text style={styles.failureTitle}>RAISON DE L'ÉCHEC</Text>
                                <Text style={styles.failureText}>{detailIntervention.failure_reason}</Text>
                            </View>
                        </View>
                    )}

                    {/* --- BUTTONS --- */}
                    <View style={styles.buttonGroup}>
                        {(canEdit || isEditingRapport) && (
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF9800' }]} onPress={modifierRapportNotes}>
                                <Ionicons name="cloud-upload" size={22} color="white" />
                                <Text style={styles.actionButtonText}>ENREGISTRER</Text>
                            </TouchableOpacity>
                        )}

                        {['en_cours', 'prevu', 'prévu'].includes(detailIntervention.statut) && canEdit && (
                            <TouchableOpacity style={styles.actionButton} onPress={() => setIsClotureModalVisible(true)}>
                                <Ionicons name="checkmark-done" size={22} color="white" />
                                <Text style={styles.actionButtonText}>CLÔTURER LA MISSION</Text>
                            </TouchableOpacity>
                        )}

                        {(['termine', 'terminé', 'echec'].includes(detailIntervention.statut)) && !isEditingRapport && (
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#2196F3' }]} onPress={() => setIsEditingRapport(true)}>
                                <Ionicons name="create" size={22} color="white" />
                                <Text style={styles.actionButtonText}>MODIFIER LE RAPPORT</Text>
                            </TouchableOpacity>
                        )}

                        {(['termine', 'terminé', 'echec'].includes(detailIntervention.statut)) && (
                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#607D8B' }]} onPress={archiverInterv}>
                                <Ionicons name="archive" size={22} color="white" />
                                <Text style={styles.actionButtonText}>ARCHIVER</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>

                {/* --- MODAL CLÔTURE --- */}
                <Modal animationType="slide" transparent visible={isClotureModalVisible} onRequestClose={() => setIsClotureModalVisible(false)}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalOverlay}
                    >
                        <View style={styles.modalContent}>
                            {isFailing ? (
                                <View style={{ width: '100%' }}>
                                    <Text style={styles.modalTitle}>Déclarer un échec</Text>
                                    <Text style={styles.modalDesc}>Pourquoi la mission n'a pas pu être réalisée ?</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Précisez la raison..."
                                        placeholderTextColor="#999"
                                        multiline
                                        value={echecRaison}
                                        onChangeText={setEchecRaison}
                                        autoFocus={true}
                                    />
                                    <View style={styles.modalFooter}>
                                        <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setIsFailing(false)}>
                                            <Text style={styles.modalBtnTextSecondary}>Retour</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.modalBtnPrimary, { backgroundColor: '#F44336' }]} onPress={() => cloturerInterv('echec')}>
                                            <Text style={styles.modalBtnTextPrimary}>Confirmer</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View style={{ width: '100%' }}>
                                    <Text style={styles.modalTitle}>Clôturer la mission</Text>
                                    <Text style={styles.modalDesc}>La mission a-t-elle été un succès ?</Text>
                                    <TouchableOpacity style={[styles.statusOption, { borderColor: '#4CAF50' }]} onPress={() => cloturerInterv('termine')}>
                                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                                        <Text style={[styles.statusOptionText, { color: '#2E7D32' }]}>Succès - Terminée</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.statusOption, { borderColor: '#F44336' }]} onPress={() => setIsFailing(true)}>
                                        <Ionicons name="close-circle" size={24} color="#F44336" />
                                        <Text style={[styles.statusOptionText, { color: '#D32F2F' }]}>Échec - Non achevée</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setIsClotureModalVisible(false)}>
                                        <Text style={styles.modalCloseText}>Annuler</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </SafeAreaView>
        </KeyboardAvoidingView>
    )
}

const InfoRow = ({ icon, label, value, isAddress, onPress }) => (
    <View style={styles.infoRow}>
        <View style={styles.infoIconBox}>
            <Ionicons name={icon} size={18} color="#6A5AE0" />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
        {isAddress && (
            <TouchableOpacity onPress={onPress}>
                <Ionicons name="map-outline" size={20} color="#6A5AE0" />
            </TouchableOpacity>
        )}
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 15, color: '#666', fontSize: 16 },
    errorText: { marginTop: 15, color: '#F44336', fontSize: 16 },
    scrollContent: { padding: 20, paddingBottom: 40 },

    headerCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        marginBottom: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    },
    headerInfo: { alignItems: 'flex-start' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    statusText: { fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase' },

    sectionTitle: { fontSize: 12, fontWeight: '800', color: '#999', marginVertical: 15, letterSpacing: 1.2 },

    infoGrid: { backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 20 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
    infoIconBox: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F0EFFF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    infoLabel: { fontSize: 11, color: '#999', textTransform: 'uppercase', marginBottom: 2 },
    infoValue: { fontSize: 16, color: '#333', fontWeight: '600' },

    gpsButton: {
        backgroundColor: '#6A5AE0',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 20,
        marginBottom: 25,
        shadowColor: "#6A5AE0",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5
    },
    gpsButtonText: { color: 'white', fontWeight: 'bold', fontSize: 15, marginLeft: 10 },

    inputContainer: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 10, marginLeft: 5 },
    textArea: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        minHeight: 120,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        textAlignVertical: 'top'
    },
    readOnlyBox: { backgroundColor: '#F5F5F5', borderRadius: 20, padding: 20, minHeight: 80 },
    readOnlyText: { fontSize: 16, color: '#666', lineHeight: 24 },

    failureBox: {
        flexDirection: 'row',
        backgroundColor: '#FFEBEE',
        padding: 20,
        borderRadius: 20,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#FFCDD2'
    },
    failureTitle: { fontSize: 12, fontWeight: 'bold', color: '#D32F2F', marginBottom: 4 },
    failureText: { fontSize: 14, color: '#B71C1C' },

    buttonGroup: { gap: 12 },
    actionButton: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3
    },
    actionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: 'white', width: '90%', borderRadius: 30, padding: 30 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 },
    modalDesc: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 25 },
    modalInput: { backgroundColor: '#F0F2F5', borderRadius: 15, padding: 15, minHeight: 100, textAlignVertical: 'top', marginBottom: 25 },
    modalFooter: { flexDirection: 'row', gap: 10 },
    modalBtnSecondary: { flex: 1, paddingVertical: 15, backgroundColor: '#F0F2F5', borderRadius: 15, alignItems: 'center' },
    modalBtnTextSecondary: { color: '#666', fontWeight: 'bold' },
    modalBtnPrimary: { flex: 2, paddingVertical: 15, backgroundColor: '#6A5AE0', borderRadius: 15, alignItems: 'center' },
    modalBtnTextPrimary: { color: 'white', fontWeight: 'bold' },
    statusOption: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 20, padding: 20, marginBottom: 15 },
    statusOptionText: { fontSize: 16, fontWeight: '700', marginLeft: 15 },
    modalCloseBtn: { marginTop: 10, alignSelf: 'center', padding: 10 },
    modalCloseText: { color: '#999', fontWeight: '600' }
});

export default DetailScreen;