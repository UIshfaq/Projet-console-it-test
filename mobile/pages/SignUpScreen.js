import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView, // Ajouté pour les écrans plus petits
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';

// Définir les mêmes constantes de couleur que dans LoginScreen
// Couleur principale de l'application (le bleu/violet)
const PRIMARY_COLOR = '#6A5AE0';
const SCREEN_BG_COLOR = '#F7F8F9';
const FORM_CONTAINER_BG_COLOR = '#FFFFFF';
const BORDER_COLOR = '#E0E0E0';
const TEXT_GRAY_COLOR = '#8A8A8A';
const VALID_COLOR = '#4CAF50';

const SignUpScreen = ({ navigation }) => {
    const [name, setName] = useState('Tayyab Sajjad');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={SCREEN_BG_COLOR} />

            <View style={styles.topPattern} />

            {/* Utiliser ScrollView au cas où le clavier cache les champs */}
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>

                <View style={styles.formContainer}>
                    <Text style={styles.title}>Sign up</Text>
                    <Text style={styles.subtitle}>Sign up with one of the following</Text>

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

                    <Text style={styles.label}>Name*</Text>
                    <View style={[styles.inputContainer, name ? styles.inputValid : null]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Your name"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                        {name && (
                            <Ionicons name="checkmark-circle" size={22} color={VALID_COLOR} />
                        )}
                    </View>

                    <Text style={styles.label}>Email*</Text>
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

                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Sign up</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkTextContainer}
                        onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>
                            Already Have Account? <Text style={styles.linkTextBold}>Log In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.bottomPattern} />
        </SafeAreaView>
    );
};

// Les styles sont très similaires à LoginScreen.
// Dans un vrai projet, vous pourriez créer un fichier de styles partagé.
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: SCREEN_BG_COLOR,
    },
    container: {
        flexGrow: 1, // Permet au ScrollView de s'étendre
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
        height: 60,
    },
    bottomPattern: {
        height: 60,
    },
});

export default SignUpScreen;