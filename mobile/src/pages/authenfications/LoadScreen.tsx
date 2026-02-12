import React from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';

const LoadingScreen = () => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

            <ActivityIndicator size="large" color="#6A5AE0" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA', // Même couleur que tes autres écrans
    }
});

export default LoadingScreen;