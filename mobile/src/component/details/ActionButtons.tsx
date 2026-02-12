import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InterventionStatus } from '../../types/Intervention';

interface Props {
    status: InterventionStatus;
    canEdit: boolean;
    isEditingRapport: boolean;

    // Nouveaux props pour les données
    notes: string;
    setNotes: (t: string) => void;
    rapport: string;
    setRapport: (t: string) => void;
    isRapportModifiable: boolean;

    // Actions
    onSave: () => void;
    onClose: () => void;
    onArchive?: () => void;     // Optionnel si tu veux le bouton archiver
    onEditRapport?: () => void; // Optionnel pour le bouton "Modifier le rapport"
}

export const ActionButtons = ({
                                  status, canEdit, isEditingRapport,
                                  notes, setNotes, rapport, setRapport, isRapportModifiable,
                                  onSave, onClose, onArchive, onEditRapport
                              }: Props) => {

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>COMPTE-RENDU & NOTES</Text>

            {/* --- 1. NOTES INTERNES --- */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Notes internes (Technicien)</Text>
                {canEdit ? (
                    <TextInput
                        style={styles.textArea}
                        placeholder="Observations internes..."
                        placeholderTextColor="#999"
                        multiline
                        value={notes}
                        onChangeText={setNotes}
                    />
                ) : (
                    <View style={styles.readOnlyBox}>
                        <Text style={styles.readOnlyText}>{notes || "Aucune note interne."}</Text>
                    </View>
                )}
            </View>

            {/* --- 2. RAPPORT CLIENT --- */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Rapport de clôture (Client)</Text>
                {isRapportModifiable ? (
                    <TextInput
                        style={[styles.textArea, { borderColor: '#4CAF50' }]}
                        placeholder="Rédigez le rapport final..."
                        placeholderTextColor="#999"
                        multiline
                        value={rapport}
                        onChangeText={setRapport}
                    />
                ) : (
                    <View style={[styles.readOnlyBox, { backgroundColor: '#E8F5E9' }]}>
                        <Text style={[styles.readOnlyText, { color: '#2E7D32' }]}>
                            {rapport || "Pas encore de rapport rédigé."}
                        </Text>
                    </View>
                )}
            </View>

            {/* --- 3. BOUTONS D'ACTION --- */}
            <View style={styles.buttonGroup}>

                {/* Bouton ENREGISTRER (Visible si on édite) */}
                {(canEdit || isEditingRapport) && (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF9800' }]} onPress={onSave}>
                        <Ionicons name="cloud-upload" size={22} color="white" />
                        <Text style={styles.actionButtonText}>ENREGISTRER</Text>
                    </TouchableOpacity>
                )}

                {/* Bouton CLÔTURER (Visible si mission non terminée) */}
                {['en_cours', 'prevu', 'prévu'].includes(status) && canEdit && (
                    <TouchableOpacity style={styles.actionButton} onPress={onClose}>
                        <Ionicons name="checkmark-done" size={22} color="white" />
                        <Text style={styles.actionButtonText}>CLÔTURER LA MISSION</Text>
                    </TouchableOpacity>
                )}

                {/* Boutons supplémentaires (Modifier / Archiver) si la mission est finie */}
                {['termine', 'terminé', 'echec'].includes(status) && !isEditingRapport && onEditRapport && (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#2196F3' }]} onPress={onEditRapport}>
                        <Ionicons name="create" size={22} color="white" />
                        <Text style={styles.actionButtonText}>MODIFIER LE RAPPORT</Text>
                    </TouchableOpacity>
                )}

                {['termine', 'terminé', 'echec'].includes(status) && onArchive && (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#607D8B' }]} onPress={onArchive}>
                        <Ionicons name="archive" size={22} color="white" />
                        <Text style={styles.actionButtonText}>ARCHIVER</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginTop: 10 },
    sectionTitle: { fontSize: 12, fontWeight: '800', color: '#999', marginVertical: 15, letterSpacing: 1.2 },

    // Styles des Inputs
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

    // Styles des Boutons
    buttonGroup: { gap: 12, marginTop: 10, marginBottom: 50 },
    actionButton: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 20,
        elevation: 3
    },
    actionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
});