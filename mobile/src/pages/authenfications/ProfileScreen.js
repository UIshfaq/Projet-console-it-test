import React, {useContext, useEffect, useState} from "react";
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert } from "react-native";
import { AuthContext } from "../../contextes/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";



function ProfileScreen() {
    const { logout } = useContext(AuthContext);
    const { userToken } = useContext(AuthContext);
    const [profileData, setProfileData] = useState()


    const fetchProfile = async () => {

        try {
            const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/users/me`;
            const response = await axios.get(backendUrl, {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            });
            setProfileData(response.data);
        } catch (error) {
            console.error("Erreur API :", error);
            Alert.alert("Erreur", "Impossible de charger le profil.");
        }


    }



    useEffect(() => {
        if (userToken) {
            fetchProfile();
        }
    }, [userToken]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarLarge}>
                        <Ionicons name="person" size={60} color="#6A5AE0" />
                    </View>
                    <Text style={styles.userName}>Technicien Console-IT</Text>
                    <Text style={styles.userRole}>Niveau Expert • Support Terrain</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>MON COMPTE</Text>
                    <ProfileOption icon="mail-outline" label="E-mail" value={profileData?.email ?? "—"} />
                    <ProfileOption icon="call-outline" label="Téléphone" value={profileData?.phone_number ?? "+33 6 00 00 00 00"} />
                    <ProfileOption icon="lock-closed-outline" label="Sécurité" value="Modifier le mot de passe" />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PRÉFÉRENCES</Text>
                    <ProfileOption icon="notifications-outline" label="Notifications" value="Activées" />
                    <ProfileOption icon="moon-outline" label="Mode sombre" value="Désactivé" />
                    <ProfileOption icon="language-outline" label="Langue" value="Français" />
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <Ionicons name="log-out-outline" size={24} color="#FF5252" />
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 2.0.1 (Stable)</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const ProfileOption = ({ icon, label, value }) => (
    <TouchableOpacity style={styles.optionRow}>
        <View style={styles.optionIconBox}>
            <Ionicons name={icon} size={20} color="#6A5AE0" />
        </View>
        <View style={styles.optionTextBox}>
            <Text style={styles.optionLabel}>{label}</Text>
            <Text style={styles.optionValue}>{value}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#CCC" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    scrollContent: { padding: 20, paddingBottom: 120 },
    profileHeader: { alignItems: 'center', marginVertical: 30 },
    avatarLarge: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 20
    },
    userName: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
    userRole: { fontSize: 14, color: '#6A5AE0', fontWeight: '600', marginTop: 4 },

    section: { backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 25 },
    sectionTitle: { fontSize: 11, fontWeight: '800', color: '#999', marginBottom: 15, letterSpacing: 1.2 },

    optionRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
    optionIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0EFFF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    optionTextBox: { flex: 1 },
    optionLabel: { fontSize: 12, color: '#999', marginBottom: 2 },
    optionValue: { fontSize: 16, color: '#333', fontWeight: '600' },

    logoutBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 82, 82, 0.1)',
        paddingVertical: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 82, 82, 0.2)'
    },
    logoutText: { color: '#FF5252', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
    versionText: { textAlign: 'center', color: '#BBB', fontSize: 12, marginTop: 30 }
});

export default ProfileScreen;
