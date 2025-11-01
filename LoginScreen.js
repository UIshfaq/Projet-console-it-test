import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (email === '' || password === '') {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        if (password === 'password123') {
            Alert.alert('Succès', 'Connexion réussie !');
            navigation.replace('Home');
        } else {
            Alert.alert('Erreur', 'Email ou mot de passe incorrect.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Se connecter</Text>

            <TextInput
                style={styles.input}
                placeholder=\"Email\"
                value={email}
                onChangeText={setEmail}
                keyboardType=\"email-address\"
                />

            <TextInput
                style={styles.input}
                placeholder=\"Mot de passe\"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Connexion</Text>
            </TouchableOpacity>
        </View>
    );
}


