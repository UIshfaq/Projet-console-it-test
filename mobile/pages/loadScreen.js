import React from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';

/**
 * L'écran de chargement simple, affiché
 * pendant que l'on vérifie le token au démarrage de l'app.
 */
const LoadingScreen = () => {
    return (
        <View style={styles.container}>
            {/* Configure la barre de statut (en haut) */}
            <StatusBar barStyle="default" />

            {/* C'est le "spinner" de chargement */}
            <ActivityIndicator size="large" color="#007AFF" />
        </View>
    );
};

// Les styles pour centrer le spinner
const styles = StyleSheet.create({
    container: {
        flex: 1, // Prend tout l'écran
        justifyContent: 'center', // Centre verticalement
        alignItems: 'center', // Centre horizontalement
        backgroundColor: '#f5f5f5', // Un fond gris clair
    }
});

export default LoadingScreen;