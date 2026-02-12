import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Intervention } from '../../types/Intervention';

interface Props {
    intervention: Intervention;
    onOpenGPS: () => void;
}

export const InfoDetails = ({ intervention, onOpenGPS }: Props) => {

    // Helper pour afficher une ligne
    const InfoRow = ({ icon, label, value, isAddress }: any) => (
        <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
                <Ionicons name={icon} size={18} color="#6A5AE0" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
            {isAddress && (
                <TouchableOpacity onPress={onOpenGPS}>
                    <Ionicons name="map-outline" size={20} color="#6A5AE0" />
                </TouchableOpacity>
            )}
        </View>
    );

    const date = new Date(intervention.date  || '').toLocaleDateString('fr-FR', { dateStyle: 'medium' });

    return (
        <View style={styles.infoGrid}>
            <InfoRow icon="calendar" label="Date" value={date} />
            <InfoRow icon="person" label="Client" value={intervention.nomClient || "Client inconnu"} />
            <InfoRow icon="location" label="Adresse" value={intervention.adresse || "Non spécifiée"} isAddress={true} />
            <InfoRow icon="information-circle" label="Description" value={intervention.description || "Aucune description"} />
        </View>
    );
};

const styles = StyleSheet.create({
    infoGrid: { backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 20 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
    infoIconBox: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F0EFFF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    infoLabel: { fontSize: 11, color: '#999', textTransform: 'uppercase', marginBottom: 2 },
    infoValue: { fontSize: 16, color: '#333', fontWeight: '600' },
});