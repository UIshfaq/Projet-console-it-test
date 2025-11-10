import React, {useContext, useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import axios from 'axios'

import {AuthContext} from "../contextes/AuthContexte";


// Couleur principale de l'application (le bleu/violet)
const PRIMARY_COLOR = '#6A5AE0';
// Couleur de fond de l'écran
const SCREEN_BG_COLOR = '#F7F8F9';
// Couleur du conteneur de formulaire blanc
const FORM_CONTAINER_BG_COLOR = '#FFFFFF';
// Couleur de bordure et d'icône grise
const BORDER_COLOR = '#E0E0E0';
// Couleur de texte gris
const TEXT_GRAY_COLOR = '#8A8A8A';
// Couleur de validation verte
const VALID_COLOR = '#4CAF50';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const { login } = useContext(AuthContext);

    const handleLogin = async () => {

        // 1. Validation (avec 'return')
        if (!email || !password) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }

        // L'URL est parfaite (en supposant que 192.168.1.80 est toujours votre IP)
        const backendUrl = "http://192.168.1.80:3000/auth/login";

        try {
            const response = await axios.post(backendUrl, {
                email: email,
                password: password
            });


            login(response.data.token);


        } catch (error) {
            // NE TOUCHEZ PAS AU CATCH
            // C'est parfait de garder l'alerte d'erreur ici.
            if (error.response) {
                Alert.alert('Erreur', error.response.data.message);
            } else {
                Alert.alert('Erreur', 'Impossible de se connecter au serveur.');
                console.error(error);
            }
        }
    }


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.kavContainer} // On lui donne un style
        >
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor={SCREEN_BG_COLOR} />

                <View style={styles.topPattern} />

                {/* <-- CHANGEMENT 2 : View devient ScrollView */}
                <ScrollView
                    style={styles.container} // Le style est conservé
                    contentContainerStyle={styles.scrollContent} // On ajoute ce style
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>

                    {/* Votre formulaire est ici. Il est PARFAIT. */}
                    <View style={styles.formContainer}>
                    <Text style={styles.title}>Log in</Text>
                    <Text style={styles.subtitle}>Log in with one of the following</Text>

                    <View style={styles.socialButtonContainer}>
                        <TouchableOpacity style={styles.socialButton}>
                            <AntDesign name="google" size={20} color="#DB4437" />
                            <Text style={styles.socialButtonText}>With Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <AntDesign name="apple" size={20} color="#000" />
                            <Text style={styles.socialButtonText}>With Apple</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Email*</Text>
                    <View style={[styles.inputContainer, email ? styles.inputValid : null]}>
                        <TextInput
                            style={styles.input}
                            placeholder="joe.doe@gmail.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {email && (
                            <Ionicons name="checkmark-circle" size={22} color={VALID_COLOR} />
                        )}
                    </View>

                    <Text style={styles.label}>Password*</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!isPasswordVisible}
                        />
                        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                            <Ionicons
                                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                                size={22}
                                color={TEXT_GRAY_COLOR}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.optionsRow}>
                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setRememberMe(!rememberMe)}>
                            <Ionicons
                                name={rememberMe ? 'checkbox' : 'checkbox-outline'}
                                size={22}
                                color={rememberMe ? PRIMARY_COLOR : TEXT_GRAY_COLOR}
                            />
                            <Text style={styles.checkboxText}>Remember info</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text style={styles.forgotPassword}>Forgot Password</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Log In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkTextContainer}
                        onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.linkText}>
                            First time here? <Text style={styles.linkTextBold}>Sign up for free</Text>
                        </Text>
                    </TouchableOpacity>
                    </View>
                </ScrollView>

                <View style={styles.bottomPattern} />
            </SafeAreaView>
        </KeyboardAvoidingView>
    )};

const styles = StyleSheet.create({

    kavContainer: { // <-- NOUVEAU STYLE (pour KeyboardAvoidingView)
        flex: 1,
    },

    scrollContent: { // <-- NOUVEAU STYLE (pour le contenu du ScrollView)
        flexGrow: 1, // Permet au contenu de s'étendre
    },

    safeArea: {
        flex: 1,
        backgroundColor: SCREEN_BG_COLOR,
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    formContainer: {
        backgroundColor: FORM_CONTAINER_BG_COLOR,
        borderRadius: 20,
        padding: 24,
        width: '100%',
    },
    backButton: {
        marginBottom: 16,
        marginTop: 16, // Ajustez si la barre de statut est incluse
        alignSelf: 'flex-start',
        padding: 8, // Zone de clic plus grande
        marginLeft: 8, // Aligner avec le padding du formulaire
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: TEXT_GRAY_COLOR,
        marginBottom: 24,
    },
    socialButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        marginHorizontal: 5, // Espace entre les boutons
    },
    socialButtonText: {
        marginLeft: 10,
        fontWeight: '600',
        color: '#000',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: SCREEN_BG_COLOR,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        paddingHorizontal: 15,
        marginBottom: 16,
    },
    inputValid: {
        borderColor: VALID_COLOR,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#000',
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxText: {
        marginLeft: 8,
        color: TEXT_GRAY_COLOR,
    },
    forgotPassword: {
        color: PRIMARY_COLOR,
        fontWeight: '600',
    },
    button: {
        backgroundColor: PRIMARY_COLOR,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkTextContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    linkText: {
        color: TEXT_GRAY_COLOR,
    },
    linkTextBold: {
        color: PRIMARY_COLOR,
        fontWeight: 'bold',
    },
    // Espaces réservés pour les motifs décoratifs
    topPattern: {
        height: 60, // Hauteur du motif du haut
        // Style pour l'image ou le SVG du motif
    },
    bottomPattern: {
        height: 60, // Hauteur du motif du bas
        // Style pour l'image ou le SVG du motif
    },
});

export default LoginScreen;