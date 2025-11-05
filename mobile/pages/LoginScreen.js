import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";

function LoginScreen() {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >

            <Text style={styles.title}>Connexion</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
                style={styles.input}
                keyboardType="email-address"
                placeholder="votre.email@exemple.com"
                autoCapitalize="none"
            />

            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
                style={styles.input}
                secureTextEntry={true}
                placeholder="********"
            />

            <TouchableOpacity style={styles.buttonContainer}>
                <Text style={styles.buttonText}>Se connecter</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
    },
    label: {
        alignSelf: 'flex-start',
        marginLeft: '5%',
        color: '#555',
        marginBottom: 5,
    },
    input: {
        width: '90%',
        height: 50,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
    },
    buttonContainer: {
        width: '90%',
        height: 50,
        backgroundColor: '#007BFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default LoginScreen;