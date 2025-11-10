import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthProvider, AuthContext } from './contextes/AuthContexte'; // Vous avez mis 'contextes', c'est parfait

// === ÉTAPE 1 : AJOUTEZ CES IMPORTS ===
// (Ils manquaient)
import LoginScreen from "./pages/LoginScreen";
import SignUpScreen from "./pages/SignUpScreen";
import HomeScreen from "./pages/HomeScreen";
// =====================================

import LoadingScreen from "./pages/loadScreen"; // Vous l'aviez déjà, c'est bien

const Stack = createStackNavigator();

// === ÉTAPE 2 : AJOUTEZ CE CODE ===
// (Vous aviez un commentaire "//..." à la place)
//
// Le "monde" déconnecté
const AuthNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}> {/* J'ai caché le header, c'est plus joli */}
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="Signup" component={SignUpScreen}/>
    </Stack.Navigator>
);

// Le "monde" connecté
const AppNavigator = () => (
    <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen}/>
        {/* On ajoutera le Planning et l'Inventaire ici plus tard */}
    </Stack.Navigator>
);
// =================================


// 1. Fonction "aiguilleur" (votre code est déjà parfait)
function AppNavigatorLogic() {
    const { isLoading, userToken } = useContext(AuthContext);

    if (isLoading) {
        return <LoadingScreen/>;
    }

    return (
        <NavigationContainer>
            {/* Cette ligne va maintenant trouver "AuthNavigator" */}
            {userToken == null ? <AuthNavigator/> : <AppNavigator/>}
        </NavigationContainer>
    );
}

// 5. NOUVEAU POINT D'ENTRÉE (votre code est déjà parfait)
export default function App() {
    return (
        <AuthProvider>
            <AppNavigatorLogic/>
        </AuthProvider>
    );
}