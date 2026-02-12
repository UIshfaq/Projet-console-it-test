import React, { useContext } from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert, Dimensions } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import {  BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { AuthContext } from "../contextes/AuthContext";
import { RootStackParamList, TabParamList } from "../types/Navigation";
import {CompositeNavigationProp} from "@react-navigation/native";


type HomeScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Dashboard'>,
    StackNavigationProp<RootStackParamList>
>;

interface Props {
    navigation: HomeScreenNavigationProp;
}

const { width } = Dimensions.get('window');

// 2. Typage des props du petit composant bouton
interface QuickActionProps {
    icon: keyof typeof Ionicons.glyphMap; // S'assure que le nom de l'icône existe vraiment !
    title: string;
    subtitle: string;
    color: string;
    onPress: () => void;
}

// Le composant QuickAction avec ses props typées
const QuickActionButton = ({ icon, title, subtitle, color, onPress }: QuickActionProps) => (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.miniIcon, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.gridTitle}>{title}</Text>
        <Text style={styles.gridSub}>{subtitle}</Text>
    </TouchableOpacity>
);

function HomeScreen({ navigation }: Props) {
    const { logout } = useContext(AuthContext);

    const today = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);

    // 3. Typage de l'argument screenName
    // On dit : "C'est soit une clé de RootStack, soit une clé de Tab, soit null"
    const handleNavigation = (screenName: keyof RootStackParamList | keyof TabParamList | null) => {
        if (screenName) {
            // @ts-ignore : TS a du mal quand on mixe Stack et Tab dans une fonction générique, on ignore juste ici pour simplifier
            navigation.navigate(screenName);
        } else {
            Alert.alert("🚧 En construction", "Ce module sera développé dans la prochaine étape du MVP.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* --- HEADER --- */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.dateText}>{formattedDate}</Text>
                        <Text style={styles.greeting}>Tableau de Bord</Text>
                    </View>
                    <TouchableOpacity style={styles.avatarButton} onPress={() => navigation.navigate("Profil")}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={24} color="#6A5AE0" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* --- MAIN ACTION --- */}
                <Text style={styles.sectionTitle}>MISSION PRIORITAIRE</Text>
                <TouchableOpacity
                    style={styles.heroCard}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate("Missions")}
                >
                    <View style={styles.heroContent}>
                        <View style={styles.heroIconContainer}>
                            <Ionicons name="map" size={32} color="white" />
                        </View>
                        <View style={styles.heroTextContainer}>
                            <Text style={styles.heroTitle}>Planning du Jour</Text>
                            <Text style={styles.heroSubtitle}>3 interventions programmées</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                    </View>
                    <View style={styles.heroFooter}>
                        <Text style={styles.heroFooterText}>Dernière mise à jour: Il y a 5 min</Text>
                    </View>
                </TouchableOpacity>

                {/* --- QUICK ACTIONS --- */}
                <Text style={styles.sectionTitle}>OUTILS RAPIDES</Text>
                <View style={styles.gridContainer}>
                    <QuickActionButton
                        icon="cube-outline"
                        title="Stock"
                        subtitle="Inventaire"
                        color="#FF9800"
                        onPress={() => handleNavigation("Inventaires")}
                    />
                    <QuickActionButton
                        icon="construct-outline"
                        title="Tickets"
                        subtitle="Support"
                        color="#E91E63"
                        onPress={() => handleNavigation(null)}
                    />
                    <QuickActionButton
                        icon="create-outline"
                        title="Signer"
                        subtitle="Validations"
                        color="#3F51B5"
                        onPress={() => handleNavigation(null)}
                    />
                    <QuickActionButton
                        icon="settings-outline"
                        title="Réglages"
                        subtitle="App"
                        color="#757575"
                        onPress={() => handleNavigation(null)}
                    />
                </View>

                {/* --- LOGOUT --- */}
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
                    <Text style={styles.logoutText}>Déconnexion sécurisée</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    scrollContent: { padding: 20, paddingBottom: 120 },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
        marginTop: 10
    },
    dateText: { fontSize: 14, color: '#666', fontWeight: '500' },
    greeting: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginTop: 4 },
    avatarButton: {}, // Ajouté pour éviter erreur si manquant
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#999',
        marginBottom: 15,
        letterSpacing: 1.2,
        marginLeft: 4
    },
    heroCard: {
        backgroundColor: '#6A5AE0',
        borderRadius: 24,
        padding: 24,
        marginBottom: 25,
        shadowColor: "#6A5AE0",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    heroContent: { flexDirection: 'row', alignItems: 'center' },
    heroIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    heroTextContainer: { flex: 1 },
    heroTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    heroFooter: {
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)'
    },
    heroFooterText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },

    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    gridCard: {
        backgroundColor: 'white',
        width: '48%',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    miniIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12
    },
    gridTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A' },
    gridSub: { fontSize: 12, color: '#999', marginTop: 2 },

    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 10,
        backgroundColor: 'rgba(231, 76, 60, 0.05)',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(231, 76, 60, 0.1)'
    },
    logoutText: { color: '#E74C3C', fontWeight: 'bold', fontSize: 14, marginLeft: 10 }
});

export default HomeScreen;