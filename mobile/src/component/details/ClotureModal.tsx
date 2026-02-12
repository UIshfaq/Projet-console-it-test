import React from 'react';
import {View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

interface Props {
    visible: boolean;
    onClose: () => void;

    // Actions
    onConfirmSuccess: () => void;
    onConfirmFailure: () => void; // Confirmer l'échec avec la raison

    // États pour le mode "Échec"
    isFailingMode: boolean;
    setFailingMode: (val: boolean) => void;
    failureReason: string;
    setFailureReason: (val: string) => void;
}

export const ClotureModal = ({visible, onClose, onConfirmSuccess, onConfirmFailure, isFailingMode, setFailingMode, failureReason, setFailureReason}: Props) => {

    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                <View style={styles.modalContent}>

                    {isFailingMode ? (
                        // --- ÉCRAN 2 : SAISIE DE LA RAISON D'ÉCHEC ---
                        <View style={{width: '100%'}}>
                            <Text style={styles.modalTitle}>Déclarer un échec</Text>
                            <Text style={styles.modalDesc}>Pourquoi la mission n'a pas pu être réalisée ?</Text>

                            <TextInput
                                style={styles.modalInput}
                                placeholder="Précisez la raison (min 10 car.)..."
                                placeholderTextColor="#999"
                                multiline
                                value={failureReason}
                                onChangeText={setFailureReason}
                                autoFocus={true}
                            />

                            <View style={styles.modalFooter}>
                                <TouchableOpacity style={styles.modalBtnSecondary}
                                                  onPress={() => setFailingMode(false)}>
                                    <Text style={styles.modalBtnTextSecondary}>Retour</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.modalBtnPrimary, {backgroundColor: '#F44336'}]}
                                                  onPress={onConfirmFailure}>
                                    <Text style={styles.modalBtnTextPrimary}>Confirmer l'échec</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        // --- ÉCRAN 1 : CHOIX SUCCÈS / ÉCHEC ---
                        <View style={{width: '100%'}}>
                            <Text style={styles.modalTitle}>Clôturer la mission</Text>
                            <Text style={styles.modalDesc}>La mission a-t-elle été un succès ?</Text>

                            <TouchableOpacity style={[styles.statusOption, {borderColor: '#4CAF50'}]}
                                              onPress={onConfirmSuccess}>
                                <Ionicons name="checkmark-circle" size={24} color="#4CAF50"/>
                                <Text style={[styles.statusOptionText, {color: '#2E7D32'}]}>Succès - Terminée</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.statusOption, {borderColor: '#F44336'}]}
                                              onPress={() => setFailingMode(true)}>
                                <Ionicons name="close-circle" size={24} color="#F44336"/>
                                <Text style={[styles.statusOptionText, {color: '#D32F2F'}]}>Échec - Non achevée</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
                                <Text style={styles.modalCloseText}>Annuler</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'},
    modalContent: {backgroundColor: 'white', width: '90%', borderRadius: 30, padding: 30},
    modalTitle: {fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 10},
    modalDesc: {fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 25},
    modalInput: {
        backgroundColor: '#F0F2F5',
        borderRadius: 15,
        padding: 15,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 25
    },
    modalFooter: {flexDirection: 'row', gap: 10},
    modalBtnSecondary: {
        flex: 1,
        paddingVertical: 15,
        backgroundColor: '#F0F2F5',
        borderRadius: 15,
        alignItems: 'center'
    },
    modalBtnTextSecondary: {color: '#666', fontWeight: 'bold'},
    modalBtnPrimary: {flex: 2, paddingVertical: 15, backgroundColor: '#6A5AE0', borderRadius: 15, alignItems: 'center'},
    modalBtnTextPrimary: {color: 'white', fontWeight: 'bold'},
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 20,
        padding: 20,
        marginBottom: 15
    },
    statusOptionText: {fontSize: 16, fontWeight: '700', marginLeft: 15},
    modalCloseBtn: {marginTop: 10, alignSelf: 'center', padding: 10},
    modalCloseText: {color: '#999', fontWeight: '600'},
});