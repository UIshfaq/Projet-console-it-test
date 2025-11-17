import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthProvider, AuthContext } from './contextes/AuthContexte';



import LoginScreen from "./pages/authentification/LoginScreen";
import SignUpScreen from "./pages/authentification/SignUpScreen";
import HomeScreen from "./pages/HomeScreen";
import InterventionScreen from "./pages/interventions/PlaningScreen";
import DetailsScreen from "./pages/interventions/detailsScreen";
// =====================================

import LoadingScreen from "./pages/authentification/LoadScreen"; // Vous l'aviez déjà, c'est bien

const Stack = createStackNavigator();


// Le "monde" déconnecté
const AuthNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
);

// Le "monde" connecté
const AppNavigator = () => (
    <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Intervention" component={InterventionScreen} />
        <Stack.Screen name={"Detail"} component={DetailsScreen}/>
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