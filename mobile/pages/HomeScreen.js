import React, { useContext } from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert } from "react-native";
import { AuthContext } from "../contextes/AuthContexte";
import { Ionicons } from '@expo/vector-icons';

function HomeScreen({ navigation }) {

    const { logout } = useContext(AuthContext);

    // Fonction pour avoir la date du jour en français (ex: "Lundi 17 novembre")
    const today = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    // On met la première lettre en majuscule (optionnel mais plus joli)
    const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);

    // Fonction générique pour gérer les clics sur les modules non finis
    const handleNavigation = (screenName) => {
        if (screenName) {
            navigation.navigate(screenName);
        } else {
            Alert.alert("🚧 En construction", "Ce module sera développé dans la prochaine étape du MVP.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* --- EN-TÊTE --- */}
                {/* --- EN-TÊTE --- */}
                <View style={styles.header}>
                    <View>
                        {/* On affiche la date en gros */}
                        <Text style={styles.greeting}>{formattedDate}</Text>
                        {/* Sous-titre plus sobre */}
                        <Text style={styles.subtitle}>Console-IT • Espace Technicien</Text>
                    </View>
                    <View style={styles.avatar}>
                        {/* J'ai changé l'icône pour un logo d'entreprise ou plus neutre */}
                        <Ionicons name="briefcase" size={24} color="#007AFF" />
                    </View>
                </View>

                {/* --- 1. ACTION PRINCIPALE (HERO) --- */}
                <Text style={styles.sectionTitle}>MA MISSION DU JOUR</Text>
                <TouchableOpacity
                    style={styles.mainCard}
                    activeOpacity={0.9}
                    onPress={() => handleNavigation("Intervention")} // Celle-ci marche !
                >
                    <View style={[styles.iconCircle, { backgroundColor: '#007AFF' }]}>
                        <Ionicons name="map" size={32} color="white" />
                    </View>
                    <View style={styles.cardTextContainer}>
                        <Text style={styles.cardTitle}>Planning & Carte</Text>
                        <Text style={styles.cardSubtitle}>Voir mes interventions et itinéraires</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#CCC" />
                </TouchableOpacity>

                {/* --- 2. AUTRES MODULES (GRILLE) --- */}
                <Text style={styles.sectionTitle}>OUTILS & SUIVI</Text>

                <View style={styles.gridContainer}>

                    {/* Module INVENTAIRE */}
                    <TouchableOpacity
                        style={styles.gridCard}
                        onPress={() => handleNavigation(null)} // Pas encore prêt
                    >
                        <View style={[styles.miniIcon, { backgroundColor: '#FFF3E0' }]}>
                            <Ionicons name="cube-outline" size={24} color="#FF9800" />
                        </View>
                        <Text style={styles.gridTitle}>Inventaire</Text>
                        <Text style={styles.gridSub}>Matériel</Text>
                    </TouchableOpacity>

                    {/* Module TICKETS */}
                    <TouchableOpacity
                        style={styles.gridCard}
                        onPress={() => handleNavigation(null)}
                    >
                        <View style={[styles.miniIcon, { backgroundColor: '#FCE4EC' }]}>
                            <Ionicons name="construct-outline" size={24} color="#E91E63" />
                        </View>
                        <Text style={styles.gridTitle}>Tickets</Text>
                        <Text style={styles.gridSub}>Incidents</Text>
                    </TouchableOpacity>

                    {/* Module SIGNATURE */}
                    <TouchableOpacity
                        style={styles.gridCard}
                        onPress={() => handleNavigation(null)}
                    >
                        <View style={[styles.miniIcon, { backgroundColor: '#E8EAF6' }]}>
                            <Ionicons name="create-outline" size={24} color="#3F51B5" />
                        </View>
                        <Text style={styles.gridTitle}>Signatures</Text>
                        <Text style={styles.gridSub}>Clients</Text>
                    </TouchableOpacity>

                    {/* Module PARAMÈTRES */}
                    <TouchableOpacity
                        style={styles.gridCard}
                        onPress={() => handleNavigation(null)}
                    >
                        <View style={[styles.miniIcon, { backgroundColor: '#F5F5F5' }]}>
                            <Ionicons name="settings-outline" size={24} color="#757575" />
                        </View>
                        <Text style={styles.gridTitle}>Réglages</Text>
                        <Text style={styles.gridSub}>Profil</Text>
                    </TouchableOpacity>
                </View>

                {/* --- PIED DE PAGE --- */}
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Ionicons name="log-out-outline" size={20} color="#E74C3C" style={{ marginRight: 10 }} />
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContent: { padding: 20 },

    // HEADER
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: 10 },
    greeting: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
    subtitle: { fontSize: 14, color: '#666' },
    avatar: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },

    sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#999', marginBottom: 15, letterSpacing: 1 },

    // MAIN CARD (Planning)
    mainCard: {
        backgroundColor: 'white', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 30,
        shadowColor: "#007AFF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    },
    iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    cardTextContainer: { flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    cardSubtitle: { fontSize: 13, color: '#888', marginTop: 2 },

    // GRID (Autres modules)
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
    gridCard: {
        backgroundColor: 'white', width: '48%', borderRadius: 16, padding: 15, marginBottom: 15, alignItems: 'flex-start',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    miniIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    gridTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    gridSub: { fontSize: 12, color: '#999' },

    // FOOTER
    logoutButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, marginTop: 10 },
    logoutText: { color: '#E74C3C', fontWeight: '600', fontSize: 16 }
});

export default HomeScreen;