import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import SignatureScreen from "react-native-signature-canvas";

interface Props {
    visible: boolean;
    onClose: () => void;
    onOK: (signature: string) => void;
}

export const SignatureModal = ({ visible, onClose, onOK }: Props) => {

    const handleEmpty = () => {
        Alert.alert("Attention", "La signature est obligatoire pour valider.");
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                <Text style={styles.title}>Signature du client</Text>

                <View style={styles.signatureBox}>
                    {Platform.OS === 'web' ? (
                        <View style={styles.webFallback}>
                            <Text style={{ marginBottom: 20, color: 'orange' }}>⚠️ Signature non dispo sur Web</Text>
                            <TouchableOpacity style={styles.simButton} onPress={() => onOK("signature_web_simulee")}>
                                <Text style={{ color: 'white' }}>SIMULER SIGNATURE</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <SignatureScreen
                            onOK={onOK}
                            onEmpty={handleEmpty}
                            descriptionText="Signez ici"
                            clearText="Effacer"
                            confirmText="Valider & Clôturer"
                            webStyle={`.m-signature-pad--footer { margin-top: 20px; } body {background-color: #f9f9f9;}`}
                        />
                    )}
                </View>

                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeText}>Annuler</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#F0F2F5' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
    signatureBox: { flex: 1, borderColor: '#DDD', borderWidth: 1, borderRadius: 20, overflow: 'hidden', backgroundColor: 'white', marginBottom: 20 },
    closeButton: { padding: 15, alignItems: 'center', marginBottom: 20 },
    closeText: { color: '#E74C3C', fontSize: 16, fontWeight: '600' },
    webFallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    simButton: { backgroundColor: '#2196F3', padding: 15, borderRadius: 8 }
});