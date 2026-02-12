import React, { useState } from 'react';
import {
    View, Text, ScrollView, SafeAreaView, ActivityIndicator,
    TouchableOpacity, Linking, Platform, KeyboardAvoidingView, StyleSheet
} from "react-native";
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Imports types & navigation
import { RootStackParamList } from "../../types/Navigation";

// Imports composants
import { InfoDetails } from '../../component/details/infoDetails';
import { MaterialList } from '../../component/details/MaterialList';
import { ActionButtons } from '../../component/details/ActionButtons';
import { ClotureModal } from "../../component/details/ClotureModal";
import { SignatureModal } from "../../component/details/SignatureModal";

// LE LIEN MAGIQUE
import { useInterventionDetails } from '../../hook/details/useInterventionDetails';

type Props = StackScreenProps<RootStackParamList, 'Detail'>;

function DetailScreen({ route, navigation }: Props) {
    const { interventionId } = route.params;

    // 1. ON APPELLE LE HOOK
    const {
        detailIntervention: intervention,
        loading: isLoading,
        notesTechnicien: notes,
        setNotesTechnicien: setNotes,
        modifierRapportNotes: saveNotes,
        cloturerInterv: closeIntervention,

        // Variables directes
        materials,
        isLoadingMaterials,
        rapport,
        setRapport,
        toggleMaterialCheck,
        handleSignatureOK,
        cloturerInterv,
        archiverInterv, // <--- On récupère la fonction d'archivage

        // Variables UI & Modales
        isFailing, setIsFailing,
        echecRaison, setEchecRaison,
        isClotureModalVisible, setIsClotureModalVisible,
        setIsClotureModalVisible: setClotureVisible,
        isSignatureVisible, setSignatureVisible,

        // États calculés pour l'édition
        canEdit,
        isRapportModifiable,
        isEditingRapport,
        setIsEditingRapport

    } = useInterventionDetails(interventionId, navigation);

    // 2. FONCTION GPS (Locale à l'écran)
    const ouvrirGPS = () => {
        const adresse = intervention?.adresse;
        if (!adresse) return;
        const query = encodeURIComponent(adresse);
        const url = Platform.select({
            ios: `http://maps.apple.com/?q=${query}`,
            android: `geo:0,0?q=${query}`,
            default: `http://googleusercontent.com/maps.google.com/?q=${query}`,
        });
        if(url) Linking.openURL(url);
    };

    if (isLoading || !intervention) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6A5AE0" />
                <Text style={{ marginTop: 10, color: '#666' }}>Chargement...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>

                    {/* 1. INFO GENERALE */}
                    <InfoDetails
                        intervention={intervention}
                        onOpenGPS={ouvrirGPS}
                    />

                    {/* 2. MATERIEL */}
                    <MaterialList
                        materials={materials}
                        isLoading={isLoadingMaterials}
                        onToggle={toggleMaterialCheck}
                    />

                    {/* 3. GROS BOUTON GPS */}
                    <TouchableOpacity style={styles.gpsButton} onPress={ouvrirGPS}>
                        <Ionicons name="navigate" size={20} color="white" />
                        <Text style={styles.gpsButtonText}>DÉMARRER LE TRAJET (GPS)</Text>
                    </TouchableOpacity>

                    {/* 4. ZONE DE FIN DE MISSION (Inputs + Boutons) */}
                    {/* Tout est géré ici maintenant, plus de TextInput qui traînent ! */}
                    <ActionButtons
                        // États
                        status={intervention.statut}
                        canEdit={canEdit}
                        isEditingRapport={isEditingRapport}
                        isRapportModifiable={isRapportModifiable}

                        // Données Textes (qu'on passe au composant pour qu'il les affiche)
                        notes={notes}
                        setNotes={setNotes}
                        rapport={rapport}
                        setRapport={setRapport}

                        // Actions
                        onSave={saveNotes}
                        onClose={() => setClotureVisible(true)}
                        onArchive={archiverInterv}
                        onEditRapport={() => setIsEditingRapport(true)}
                    />

                </ScrollView>

                {/* --- MODALES --- */}
                <ClotureModal
                    visible={isClotureModalVisible}
                    onClose={() => setClotureVisible(false)}
                    onConfirmSuccess={() => cloturerInterv('termine')}
                    onConfirmFailure={() => cloturerInterv('echec')}
                    isFailingMode={isFailing}
                    setFailingMode={setIsFailing}
                    failureReason={echecRaison}
                    setFailureReason={setEchecRaison}
                />

                <SignatureModal
                    visible={isSignatureVisible}
                    onClose={() => setSignatureVisible(false)}
                    onOK={handleSignatureOK}
                />

            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },

    gpsButton: {
        backgroundColor: '#6A5AE0',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 20,
        marginBottom: 10,
        marginTop: 10,
        shadowColor: "#6A5AE0",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5
    },
    gpsButtonText: { color: 'white', fontWeight: 'bold', fontSize: 15, marginLeft: 10 },
});

export default DetailScreen;