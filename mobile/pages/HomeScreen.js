import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../contextes/AuthContexte";

function HomeScreen({ navigation }) {

    // On récupère la fonction "logout" du contexte (c'est parfait)
    const { logout } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenue !</Text>
            {/* Le sous-titre doit confirmer la connexion, pas demander de se connecter */}
            <Text style={styles.subtitle}>Vous êtes connecté et pouvez commencer le travail.</Text>


            <TouchableOpacity
                style={styles.buttonContainer}
                onPress={logout} // <-- APPELLE LA FONCTION LOGOUT
            >
                <Text style={styles.buttonText}>Se déconnecter</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    buttonContainer: {
        width: '90%',
        height: 50,
        backgroundColor: '#E74C3C', // Couleur Rouge pour la déconnexion
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default HomeScreen;