// HomeScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Bienvenue sur la page d’accueil 🎉</Text>
            <Button title="Se déconnecter" onPress={() => navigation.replace('Login')} />
        </View>
    );
}

