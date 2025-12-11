import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';


// Couleurs
const PRIMARY_COLOR = '#6A5AE0';
const SCREEN_BG_COLOR = '#F7F8F9';
const BORDER_COLOR = '#E0E0E0';
const VALID_COLOR = '#4CAF50';
const TEXT_GRAY_COLOR = '#8A8A8A';

const emailRegex = /\S+@\S+\.\S+/;

const SignUpScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [statusMessage, setStatusMessage] = useState(''); // Pour afficher le statut en bas de l'écran

    // Logique de changement d'email
    const handleEmailChange = (text) => {
        setEmail(text);
        setIsEmailValid(emailRegex.test(text)); // Met à jour l'état de validation
    };

    const handleSignup = async () => {
        setStatusMessage(''); // Réinitialise le message

        // --- 1. Validations Front-end ---
        if (!name || !email || !password) {
            setStatusMessage('Erreur: Veuillez remplir tous les champs.');
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        if (password.length < 8 || !/\d/.test(password) || !/[a-z]/.test(password) || !/[!@#$%^&*]/.test(password)|| !/[A-Z]/.test(password)) {
            setStatusMessage("Erreur: Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un charactère spéciale et un chiffre.");
            Alert.alert("Erreur", "Le mot de passe doit contenir au moins 8 caractères. Il doit inclure des lettres, des chiffres, des caractères spéciaux et majuscle.");
            return;
        }

        if (!isEmailValid) {
            setStatusMessage("Erreur: Veuillez entrer une adresse e-mail valide.");
            Alert.alert("Erreur", "Veuillez entrer une adresse e-mail valide.");
            return;
        }

        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/auth/register`;



        try {
            const response = await axios.post(backendUrl, {
                nom: name,
                email: email,
                password: password,
            });

            // --- SUCCÈS ---
            const message = response.data.message || 'Inscription réussie !';
            setStatusMessage(`Succès: ${message}`);

            // Si l'alerte n'apparaît pas, le message de statut prend le relais
            Alert.alert('Succès', message, [
                { text: 'OK', onPress: () => navigation.push('Login') },
            ]);

        } catch (error) {
            console.error("ERREUR AXIOS COMPLÈTE:", error);

            if (error.response) {
                // Erreur serveur (ex: Email déjà utilisé)
                const msg = error.response.data.message || "Erreur serveur inconnue (4xx/5xx)";
                setStatusMessage(`Erreur Serveur: ${msg}`);
                Alert.alert('Erreur', msg);
            } else {
                // Erreur réseau (ECONNREFUSED, timeout, etc.)
                const msg = 'Impossible de se connecter au serveur. Vérifiez l\'URL et votre réseau.';
                setStatusMessage(`Erreur Réseau: ${msg}`);
                Alert.alert('Erreur', msg);
            }
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={SCREEN_BG_COLOR} />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Sign Up</Text>

                <View style={styles.formCompactContainer}>
                    {/* Name */}
                    <View style={[styles.inputContainer, name.length > 0 ? styles.inputValid : null]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                        {name.length > 0 ? <Ionicons name="checkmark-circle" size={22} color={VALID_COLOR} /> : null}
                    </View>

                    {/* Email */}
                    <View style={[styles.inputContainer, isEmailValid ? styles.inputValid : null]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={handleEmailChange}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {isEmailValid ? <Ionicons name="checkmark-circle" size={22} color={VALID_COLOR} /> : null}
                    </View>

                    {/* Password */}
                    <View style={[styles.inputContainer, password.length >= 8 ? styles.inputValid : null]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Password (min. 8 chars)"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!isPasswordVisible}
                        />
                        {password.length >= 8 ? <Ionicons name="checkmark-circle" size={22} color={VALID_COLOR} /> : null}
                        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={{ paddingLeft: 10 }}>
                            <Ionicons
                                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                                size={22}
                                color={TEXT_GRAY_COLOR}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Affichage du message de statut pour le débogage (plus fiable que Alert) */}
                    {statusMessage ? <Text style={statusMessage.startsWith('Erreur') ? styles.statusTextError : styles.statusTextSuccess}>{statusMessage}</Text> : null}

                    {/* Sign Up Button */}
                    <TouchableOpacity style={styles.button} onPress={handleSignup}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>

                    {/* Link to Login */}
                    <TouchableOpacity onPress={() => navigation.push('Login')}>
                        <Text style={styles.linkText}>
                            Already have an account? <Text style={styles.linkTextBold}>Log In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Styles
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: SCREEN_BG_COLOR,
    },
    container: {
        flexGrow: 1,
        padding: 16,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 24,
        alignSelf: 'center',
    },
    formCompactContainer: {
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        paddingHorizontal: 15,
        marginBottom: 12,
        height: 50,
    },
    inputValid: {
        borderColor: VALID_COLOR,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    button: {
        backgroundColor: PRIMARY_COLOR,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkText: {
        color: TEXT_GRAY_COLOR,
        textAlign: 'center',
        marginTop: 10,
    },
    linkTextBold: {
        color: PRIMARY_COLOR,
        fontWeight: 'bold',
    },
    statusTextError: {
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 14,
        color: 'red',
        fontWeight: '500',
    },
    statusTextSuccess: {
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 14,
        color: VALID_COLOR,
        fontWeight: '500',
    },
});

export default SignUpScreen;