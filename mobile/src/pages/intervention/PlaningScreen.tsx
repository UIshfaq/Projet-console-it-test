import React, { useState, useContext, useCallback, useLayoutEffect } from 'react';
import { DeviceEventEmitter, View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, TextInput, ListRenderItem } from 'react-native';
import axiosMobile from '../../api/axiosMobile';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// Imports
import { AuthContext } from '../../contextes/AuthContext';
import { useNetwork } from '../../contextes/NetworkContext';
import { RootStackParamList, TabParamList } from '../../types/Navigation';
import { Intervention } from '../../types/Intervention'; // Import du type
import { InterventionCard } from '../../component/planing/InterventionCard'; // Import du composant
import { getLocalInterventions } from '../../services/database';

// Typage Navigation
type InterventionScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Missions'>,
    StackNavigationProp<RootStackParamList>
>;

interface Props {
    navigation: InterventionScreenNavigationProp;
}

function InterventionScreen({ navigation }: Props) {
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [filteredInterventions, setFilteredInterventions] = useState<Intervention[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const { userToken } = useContext(AuthContext);
    const { isConnected } = useNetwork();

    const afficherInterventions = async () => {
        if (!userToken) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            if (isConnected) {
                const response = await axiosMobile.get<Intervention[]>('interventions/');
                setInterventions(response.data);
                setFilteredInterventions(response.data);
            } else {
                const localData = (await getLocalInterventions()) as unknown as Intervention[];
                setInterventions(localData);
                setFilteredInterventions(localData);
            }
        } catch (error: any) {
            console.error("Erreur API :", error.response?.data || error.message);
            const localData = (await getLocalInterventions()) as unknown as Intervention[];
            setInterventions(localData);
            setFilteredInterventions(localData);
        } finally {
            setIsLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            afficherInterventions();
        }, [userToken, isConnected])
    );

    React.useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('sync_completed', () => {
            afficherInterventions();
        });

        return () => subscription.remove();
    }, [userToken, isConnected]);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text === '') {
            setFilteredInterventions(interventions);
        } else {
            const filtered = interventions.filter(item => {
                const titre = item.titre?.toLowerCase() || '';
                const client = (item.nomClient || '').toLowerCase();
                const adresse = item.adresse?.toLowerCase() || '';
                const search = text.toLowerCase();
                return titre.includes(search) || client.includes(search) || adresse.includes(search);
            });
            setFilteredInterventions(filtered);
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({ headerTitle: 'Mes Missions' });
    }, [navigation]);

    // C'est ici que ça devient magique : le renderItem est minuscule
    const renderItem: ListRenderItem<Intervention> = ({ item }) => (
        <InterventionCard
            item={item}
            onPress={() => navigation.navigate('Detail', { interventionId: item.id })}
        />
    );

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#6A5AE0" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchBarContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher une mission..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>

            <FlatList
                data={filteredInterventions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="clipboard-outline" size={64} color="#CCC" />
                        <Text style={styles.emptyText}>Aucune mission trouvée.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginVertical: 15,
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 50,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16, color: '#1A1A1A' },
    listContent: { paddingHorizontal: 16, paddingBottom: 120 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#999', marginTop: 15, fontSize: 16 },
});

export default InterventionScreen;