import React, { useContext, useState } from 'react';

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

import { AuthContext } from "../../contextes/AuthContext";


const PRIMARY_COLOR = '#6A5AE0';
const SCREEN_BG_COLOR = '#F7F8F9';
const FORM_CONTAINER_BG_COLOR = '#FFFFFF';
const BORDER_COLOR = '#E0E0E0';
const TEXT_GRAY_COLOR = '#8A8A8A';
const VALID_COLOR = '#4CAF50';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);


    const { login } = useContext(AuthContext);

    const handleLogin = async () => {

        // console.log("CONTENU EMAIL:", `"${email}"`);
        // console.log("CONTENU PASSWORD:", `"${password}"`);
        if (email === "" || password === "") {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            console.log("erreur: champs vides");
            return;
        }



        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/auth/login`;

        try {
            const response = await axios.post(backendUrl, {
                email: email,
                password: password,
            });

            const { token, user } = response.data;

            await login(token);


            Alert.alert(`Connexion réussie!`, `Bienvenue, ${user.nom || 'utilisateur'}.`);


        } catch (error) {
            console.error("Erreur de connexion:", error);
            if (error.response) {
                Alert.alert('Erreur', error.response.data.message);
            } else {
                Alert.alert('Erreur', 'Impossible de se connecter au serveur.');
            }
        }
    }


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.kavContainer}>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor={SCREEN_BG_COLOR} />

                <View style={styles.topPattern} />

                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.scrollContent}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>

                    {/* Le reste de votre formulaire (qui est parfait) reste inchangé */}
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
                                placeholder="exmaple@gmail.com"
                                placeholderTextColor={TEXT_GRAY_COLOR}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            {email ? (
                                <Ionicons
                                    name="checkmark-circle"
                                    size={22}
                                    color={VALID_COLOR}
                                />
                            ) : (
                                <Ionicons
                                    name="mail-outline"
                                    size={22}
                                    color={TEXT_GRAY_COLOR}
                                />
                            )}
                        </View>

                        <Text style={styles.label}>Password*</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={TEXT_GRAY_COLOR}
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
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={styles.buttonText}>Log In</Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>

                <View style={styles.bottomPattern} />
            </SafeAreaView>
        </KeyboardAvoidingView>
    )
};

// ... (Tous vos styles restent les mêmes)
const styles = StyleSheet.create({

    kavContainer: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
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
        marginTop: 16,
        alignSelf: 'flex-start',
        padding: 8,
        marginLeft: 8,
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
        marginHorizontal: 5,
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
    topPattern: {
        height: 60,
    },
    bottomPattern: {
        height: 60,
    },
});

export default LoginScreen;