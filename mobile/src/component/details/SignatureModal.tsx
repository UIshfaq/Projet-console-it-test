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

    // Style injecté pour forcer la visibilité et le placement des boutons
    const styleJS = `
        .m-signature-pad {
            box-shadow: none; border: none;
            background-color: #ffffff;
        }
        .m-signature-pad--body {
            border: 1px solid #E0E0E0;
            bottom: 60px; /* On remonte le corps pour laisser de la place au footer */
        }
        .m-signature-pad--footer {
            position: absolute;
            bottom: 0px;
            left: 0;
            right: 0;
            height: 50px;
            display: flex;
            background-color: #f9f9f9;
            justify-content: space-around;
            align-items: center;
            padding: 0 10px;
        }
        .m-signature-pad--footer .button {
            height: 40px;
            line-height: 40px;
            text-align: center;
            flex: 1;
            margin: 5px;
            border-radius: 6px;
            font-family: sans-serif;
            font-size: 14px;
            font-weight: bold;
            color: #fff;
            cursor: pointer;
        }
        .m-signature-pad--footer .button.clear {
            background-color: #E74C3C;
        }
        .m-signature-pad--footer .button.save {
            background-color: #2ECC71;
        }
        .description { display: none; } /* On cache le texte de description par défaut */
    `;

    return (
        <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
            <View style={styles.container}>
                <Text style={styles.title}>Signature du client</Text>

                <View style={styles.signatureBox}>
                    {Platform.OS === 'web' ? (
                        <View style={styles.webFallback}>
                            <Text style={{ marginBottom: 20, color: 'orange' }}>⚠️ Mode Web : Simulation</Text>
                            <TouchableOpacity style={styles.simButton} onPress={() => onOK("signature_web_simulee")}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>SIMULER SIGNATURE</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <SignatureScreen
                            onOK={onOK}
                            onEmpty={handleEmpty}
                            autoClear={false}
                            imageType="image/png"
                            descriptionText=""
                            clearText="Effacer"
                            confirmText="Valider"
                            webStyle={styleJS}
                            style={{ flex: 1 }} // Indispensable pour que la WebView occupe toute la signatureBox
                        />
                    )}
                </View>

                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeText}>Annuler et fermer</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#F8F9FA'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2C3E50',
        marginBottom: 30
    },
    signatureBox: {
        height: 350, // On augmente légèrement la hauteur
        borderColor: '#BDC3C7',
        borderWidth: 1,
        borderRadius: 12,
        overflow: 'hidden', // Très important pour que les boutons HTML restent dans le cadre
        backgroundColor: 'white',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    closeButton: {
        marginTop: 20,
        padding: 15,
        alignItems: 'center',
    },
    closeText: {
        color: '#95A5A6',
        fontSize: 16,
        fontWeight: '500'
    },
    webFallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    simButton: { backgroundColor: '#3498DB', padding: 12, borderRadius: 6 }
});