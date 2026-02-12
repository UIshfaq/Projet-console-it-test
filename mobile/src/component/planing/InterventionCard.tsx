import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Intervention } from '../../types/Intervention';

interface InterventionCardProps {
    item : Intervention;
    onPress: () => void;
}
// dans le planning Screen
export const InterventionCard = ({ item, onPress }: InterventionCardProps) => {

    const getDateParts = (dateString?: string) => {
        if (!dateString) return { day: '--', month: '--' };
        const date = new Date(dateString);
        const day = date.toLocaleDateString('fr-FR', { day: '2-digit' });
        const month = date.toLocaleDateString('fr-FR', { month: 'short' });
        return { day, month: month.replace('.', '').toUpperCase() };
    };

    const getStatusStyle = (status: string) => {
        // On normalise en minuscule au cas où l'API renvoie "Terminé" avec majuscule
        const s = status?.toLowerCase();
        switch (s) {
            case 'en_cours': return { bg: '#FFF4E5', text: '#FF9800', label: 'En Cours', icon: 'time-outline' as const };
            case 'termine':
            case 'terminé': return { bg: '#E8F5E9', text: '#4CAF50', label: 'Terminé', icon: 'checkmark-circle-outline' as const };
            case 'prevu':
            case 'prévu': return { bg: '#E3F2FD', text: '#2196F3', label: 'Prévu', icon: 'calendar-outline' as const };
            case 'echec': return { bg: '#FFEBEE', text: '#F44336', label: 'Échec', icon: 'alert-circle-outline' as const };
            case 'archiver': return { bg: '#F5F5F5', text: '#9E9E9E', label: 'Archivé', icon: 'archive-outline' as const };
            default: return { bg: '#F5F5F5', text: '#9E9E9E', label: status, icon: 'help-circle-outline' as const };
        }
    };

    const { day, month } = getDateParts(item.date);
    const statusStyle = getStatusStyle(item.statut);

    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
            <View style={styles.cardHeader}>
                <View style={styles.dateBadge}>
                    <Text style={styles.dateDay}>{day}</Text>
                    <Text style={styles.dateMonth}>{month}</Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.missionTitle} numberOfLines={1}>{item.titre}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Ionicons name={statusStyle.icon} size={12} color={statusStyle.text} style={{ marginRight: 4 }} />
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="person" size={14} color="#6A5AE0" />
                    </View>
                    <Text style={styles.infoText} numberOfLines={1}>
                        {/* Ici on utilise bien nomClient qui vient de la BDD */}
                        {item.nomClient || "Client inconnu"}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="location" size={14} color="#6A5AE0" />
                    </View>
                    <Text style={styles.infoText} numberOfLines={1}>
                        {item.adresse}
                    </Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                {/* Tu pourras rendre l'heure dynamique plus tard si tu ajoutes un champ 'heure' en BDD */}
                <Text style={styles.footerTime}>Rdv programmé</Text>
                <Ionicons name="chevron-forward-circle" size={24} color="#6A5AE0" />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        marginBottom: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    dateBadge: {
        backgroundColor: '#F0EFFF',
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 55,
    },
    dateDay: { fontSize: 20, fontWeight: 'bold', color: '#6A5AE0' },
    dateMonth: { fontSize: 10, fontWeight: 'bold', color: '#6A5AE0', marginTop: -2 },
    headerInfo: { flex: 1, marginLeft: 15 },
    missionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 6 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    cardBody: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F0F0F0',
        paddingVertical: 12,
        marginBottom: 12,
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    iconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F0EFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    infoText: { fontSize: 14, color: '#666', flex: 1 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerTime: { fontSize: 13, color: '#999', fontWeight: '600' },
});