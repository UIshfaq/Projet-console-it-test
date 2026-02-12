import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Material } from '../../types/Materiel';

interface Props {
    materials: Material[];
    isLoading: boolean;
    onToggle: (id: number, currentStatus: boolean | number | undefined) => void;
}

export const MaterialList = ({ materials, isLoading, onToggle }: Props) => {
    const materielAEmporter = materials.filter(m => m.to_bring === 1 || m.to_bring === true);
    const materielSurPlace = materials.filter(m => m.to_bring === 0 || m.to_bring === false);

    return (
        <View style={styles.container}>

            {/* --- SECTION 1 : À EMPORTER (Camion) --- */}
            {materielAEmporter.length > 0 && (
                <>
                    <View style={styles.headerRow}>
                        <Ionicons name="cart-outline" size={18} color="#FF9800" />
                        <Text style={styles.sectionTitle}>À PRENDRE</Text>
                    </View>

                    {materielAEmporter.map((item, index) => {
                        const isChecked = item.is_checked === 1 || item.is_checked === true;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[styles.itemRow, isChecked && styles.itemRowChecked]}
                                onPress={() => onToggle(item.id, item.is_checked)}
                            >
                                <View style={styles.checkboxContainer}>
                                    <Ionicons
                                        name={isChecked ? "checkbox" : "square-outline"}
                                        size={24}
                                        color={isChecked ? "#4CAF50" : "#999"}
                                    />
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={[styles.itemText, isChecked && styles.itemTextChecked]}>
                                        {item.quantity_required}x {item.name}
                                    </Text>
                                    {isChecked && <Text style={styles.subText}>Chargé dans le véhicule</Text>}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </>
            )}

            {/* --- SECTION 2 : SUR PLACE (Chez le client) --- */}
            {materielSurPlace.length > 0 && (
                <>
                    <View style={[styles.headerRow, { marginTop: 25 }]}>
                        <Ionicons name="location-outline" size={18} color="#2196F3" />
                        <Text style={[styles.sectionTitle, { color: '#2196F3' }]}>DÉJÀ SUR PLACE (CLIENT)</Text>
                    </View>

                    {materielSurPlace.map((item, index) => (
                        <View key={index} style={styles.itemRowStatic}>
                            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="home" size={16} color="#2196F3" />
                            </View>
                            <View style={{flex: 1}}>
                                <Text style={styles.itemTextStatic}>
                                    {item.quantity_required}x {item.name}
                                </Text>
                                <Text style={styles.subText}>Équipement client / Immeuble</Text>
                            </View>

                        </View>
                    ))}
                </>
            )}

        </View>
    );
};
const styles = StyleSheet.create({
    container: { marginBottom: 10 },
    emptyContainer: { padding: 20, alignItems: 'center' },
    emptyText: { color: '#999', fontStyle: 'italic' },

    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
    sectionTitle: { fontSize: 12, fontWeight: '800', color: '#FF9800', letterSpacing: 1 },

    // Styles À Emporter
    itemRow: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
        padding: 15, borderRadius: 12, marginBottom: 8,
        borderWidth: 1, borderColor: 'transparent',
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 1
    },
    itemRowChecked: { backgroundColor: '#F1F8E9', borderColor: '#C8E6C9' },
    checkboxContainer: { marginRight: 15 },
    itemText: { fontSize: 15, fontWeight: '600', color: '#333' },
    itemTextChecked: { color: '#4CAF50', textDecorationLine: 'line-through' },
    subText: { fontSize: 11, color: '#999', marginTop: 2 },

    // Styles Sur Place
    itemRowStatic: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5',
        padding: 15, borderRadius: 12, marginBottom: 8, opacity: 0.9
    },
    iconBox: {
        width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15
    },
    itemTextStatic: { fontSize: 15, fontWeight: '600', color: '#555' }
});