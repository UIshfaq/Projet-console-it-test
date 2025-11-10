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

const SignUpScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleSignup = async () => {
        if (!name || !email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/auth/register`;

        console.log("J'essaie d'appeler cette URL :", backendUrl);
        try {
            const response = await axios.post(backendUrl, {
                nom: name,
                email: email,
                password: password,
            });

            Alert.alert('Succès', response.data.message, [
                { text: 'OK', onPress: () => navigation.push('Login') },
            ]);
        } catch (error) {
            if (error.response) {
                Alert.alert('Erreur', error.response.data.message);
            } else {
                Alert.alert('Erreur', 'Impossible de se connecter au serveur.');
                console.error(error);
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
                    <View style={[styles.inputContainer, name ? styles.inputValid : null]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                        {name ? <Ionicons name="checkmark-circle" size={22} color={VALID_COLOR} /> : null}
                    </View>

                    {/* Email */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password */}
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
});

export default SignUpScreen;
