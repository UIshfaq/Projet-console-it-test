import React from 'react';
import {
    View, Text, ScrollView, SafeAreaView, ActivityIndicator,
    TouchableOpacity, Linking, Platform, KeyboardAvoidingView, StyleSheet
} from "react-native";
// Pour typer la prop "navigation" dans un composant classique

// Pour typer l'écran entier (navigation + route params)
import { StackScreenProps } from '@react-navigation/stack';
import {Ionicons} from '@expo/vector-icons';

// Imports types & navigation
import {RootStackParamList} from "../../types/Navigation";

// Imports composants
import {InfoDetails} from '../../component/details/infoDetails';
import {MaterialList} from '../../component/details/MaterialList';
import {ActionButtons} from '../../component/details/ActionButtons';
import {ClotureModal} from "../../component/details/ClotureModal";
import {SignatureModal} from "../../component/details/SignatureModal";

// LE LIEN MAGIQUE
import {useInterventionDetails} from '../../hook/details/useInterventionDetails';
import {usePdfGenerator} from "../../hook/details/usePdfGenerator";

type Props = StackScreenProps<RootStackParamList, 'Detail'>;

function DetailScreen({route, navigation}: Props) {
    const {interventionId} = route.params;
    const {generateAndSharePdf, isDownloading} = usePdfGenerator();


    // 1. ON APPELLE LE HOOK
    const {
        detailIntervention: intervention,
        loading: isLoading,
        notesTechnicien: notes,
        setNotesTechnicien: setNotes,
        modifierRapportNotes: saveNotes,

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
        isClotureModalVisible,
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
        if (url) Linking.openURL(url);
    };

    if (isLoading || !intervention) {
        if (!isLoading && !intervention) {
            return (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
                    <Text style={{fontSize: 16, fontWeight: '600', color: '#B91C1C', textAlign: 'center'}}>
                        Impossible de charger les détails de cette intervention.
                    </Text>
                    <Text style={{marginTop: 8, color: '#666', textAlign: 'center'}}>
                        Vérifie ta connexion ou les droits du compte connecté.
                    </Text>
                </View>
            );
        }

        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#6A5AE0"/>
                <Text style={{marginTop: 10, color: '#666'}}>Chargement...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={{padding: 20, paddingBottom: 100}}>

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
                        <Ionicons name="navigate" size={20} color="white"/>
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
                    onConfirmSuccess={() => {
                        setClotureVisible(false);
                        setSignatureVisible(true);
                    }}
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

                {intervention && ['termine', 'archiver','echec'].includes(intervention.statut) && (
                    <TouchableOpacity
                        style={[styles.pdfButton, isDownloading && styles.pdfButtonDisabled]}
                        disabled={isDownloading}
                        onPress={() => generateAndSharePdf(interventionId)}
                    >
                        <Ionicons name="document-text" size={20} color="white"/>
                        <Text style={styles.pdfButtonText}>
                            {isDownloading ? "Génération en cours..." : "Télécharger le PDF"}
                        </Text>
                    </TouchableOpacity>
                )}

            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#F0F2F5'},

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
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5
    },
    pdfButton: {
        backgroundColor: '#E74C3C', // Un beau rouge pour les PDF
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 20,
        shadowColor: "#E74C3C",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5
    },
    pdfButtonDisabled: {
        backgroundColor: '#E08283', // Plus clair quand ça charge
        shadowOpacity: 0,
    },
    pdfButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 10
    },
    gpsButtonText: {color: 'white', fontWeight: 'bold', fontSize: 15, marginLeft: 10},
});

export default DetailScreen;