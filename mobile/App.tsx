import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from '@expo/vector-icons';

// 1. On importe le contexte et les types qu'on vient de créer
import { AuthContext, AuthProvider } from "./src/contextes/AuthContext";
import { RootStackParamList, TabParamList } from "./src/types/Navigation";

import LoginScreen from "./src/pages/authenfications/LoginScreen";
import HomeScreen from "./src/pages/HomeScreen";
import InterventionScreen from "./src/pages/intervention/PlaningScreen";
import DetailsScreen from "./src/pages/intervention/detailsScreen";
import ArchiverScreen from "./src/pages/intervention/intervArchiverScreen";
import LoadingScreen from "./src/pages/authenfications/LoadScreen";
import InventaireScreen from "./src/pages/inventaire/inventaireScreen";
import ProfileScreen from "./src/pages/authenfications/ProfileScreen";

// 3. C'est ICI la magie : on injecte nos types dans les créateurs de navigation
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const AuthNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
);

const TabNavigator = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap = 'help'; // Valeur par défaut pour TS

                if (route.name === 'Dashboard') {
                    iconName = focused ? 'grid' : 'grid-outline';
                } else if (route.name === 'Missions') {
                    iconName = focused ? 'calendar' : 'calendar-outline';
                } else if (route.name === 'Archives') {
                    iconName = focused ? 'archive' : 'archive-outline';
                } else if (route.name === 'Profil') {
                    iconName = focused ? 'person' : 'person-outline';
                }
                return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#6A5AE0',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
                position: 'absolute',
                bottom: 25,
                left: 20,
                right: 20,
                height: 70,
                borderRadius: 25,
                backgroundColor: '#FFF',
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 15,
                elevation: 10,
                borderTopWidth: 0,
                paddingBottom: 0,
            },
            tabBarItemStyle: { height: 70 },
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 10 },
            tabBarIconStyle: { marginTop: 5 },
            headerStyle: {
                backgroundColor: '#FFF',
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 1,
                borderBottomColor: '#F0F0F0',
            },
            headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 18,
                color: '#1A1A1A',
            },
        })}
    >
        <Tab.Screen name="Dashboard" component={HomeScreen} options={{ title: 'Accueil' }} />
        <Tab.Screen name="Missions" component={InterventionScreen} options={{ title: 'Planning' }} />
        <Tab.Screen name="Archives" component={ArchiverScreen} options={{ title: 'Archives' }} />
        <Tab.Screen name="Profil" component={ProfileScreen} options={{ title: 'Mon Profil' }} />
    </Tab.Navigator>
);

const AppNavigator = () => (
    <Stack.Navigator screenOptions={{
        headerStyle: { elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#EEE' },
        headerTitleStyle: { fontWeight: 'bold' }
    }}>
        <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />

        {/* TypeScript sait maintenant que cet écran attend un 'interventionId' */}
        <Stack.Screen name="Detail" component={DetailsScreen} options={{ title: 'Détail Mission' }} />

        <Stack.Screen name="Inventaires" component={InventaireScreen} />
    </Stack.Navigator>
);

function AppNavigatorLogic() {
    // Ici, le contexte est maintenant typé !
    const { isLoading, userToken } = useContext(AuthContext);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer>
            {userToken == null ? <AuthNavigator /> : <AppNavigator />}
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppNavigatorLogic />
        </AuthProvider>
    );
}