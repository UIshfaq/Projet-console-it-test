import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Alert, Platform } from 'react-native';
import { AuthContext } from '../../contextes/AuthContext';
import { Intervention, InterventionStatus } from '../../types/Intervention' // Assure-toi que ces types existent
import { Material } from '../../types/Materiel';

// On ajoute 'navigation' aux paramètres pour pouvoir faire le goBack()
export const useInterventionDetails = (interventionId: number, navigation: any) => {
    const { userToken } = useContext(AuthContext);

    // --- STATES DE DONNÉES ---
    const [detailIntervention, setDetailIntervention] = useState<Intervention | null>(null);
    const [materials, setMaterials] = useState<Material[]>([]);

    // --- STATES DE CHARGEMENT ---
    const [loading, setLoading] = useState<boolean>(true);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState<boolean>(true);

    // --- STATES DE FORMULAIRE ---
    const [rapport, setRapport] = useState<string>('');
    const [notesTechnicien, setNotesTechnicien] = useState<string>('');
    const [echecRaison, setEchecRaison] = useState<string>('');

    // --- STATES D'INTERFACE (UI) ---
    const [isEditingRapport, setIsEditingRapport] = useState<boolean>(false);
    const [isClotureModalVisible, setIsClotureModalVisible] = useState<boolean>(false);
    const [isFailing, setIsFailing] = useState<boolean>(false);

    // --- STATES DE SIGNATURE ---
    const [isSignatureVisible, setSignatureVisible] = useState<boolean>(false);
    const [signatureData, setSignatureData] = useState<string | null>(null);

    // 1. CHARGEMENT DES DONNÉES
    const chargerDescription = async () => {
        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/${interventionId}`;
        try {
            const response = await axios.get(backendUrl, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            const data = response.data;
            setDetailIntervention(data);

            // Si les matériaux sont inclus dans la réponse
            if (data.materials && Array.isArray(data.materials)) {
                setMaterials(data.materials);
            }

            if (data.rapport) setRapport(data.rapport);
            if (data.notes_technicien) setNotesTechnicien(data.notes_technicien);
        } catch (e) {
            console.error("Erreur API Détails :", e);
        } finally {
            setLoading(false);
            // On considère que si on a chargé l'intervention, on a fini le gros du travail
            // (fetchMaterials s'occupera de compléter si besoin)
        }
    };

    const fetchMaterials = async () => {
        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/inventaires/${interventionId}/materials`;
        try {
            const response = await axios.get(backendUrl, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setMaterials(response.data);
        } catch (e) {
            console.error("Erreur récupération matériaux :", e);
        } finally {
            setIsLoadingMaterials(false);
        }
    };

    useEffect(() => {
        chargerDescription();
        fetchMaterials();
    }, [interventionId]); // Ajout de la dépendance interventionId

    // 2. LOGIQUE MÉTIER & CALCULS

    // Calcul des permissions (Dérivé du state)
    const isFinalStatus = detailIntervention ? ['archiver', 'termine', 'echec'].includes(detailIntervention.statut) : false;
    const canEdit = !isFinalStatus;
    const isRapportModifiable = detailIntervention ? (detailIntervention.statut === "prévu" || detailIntervention.statut === "en_cours") || isEditingRapport : false;

    // Mise à jour des notes et rapport
    const modifierRapportNotes = async () => {
        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/${interventionId}/modifier`;
        try {
            await axios.patch(backendUrl, {
                rapport: rapport,
                notes_technicien: notesTechnicien,
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            // Mise à jour locale optimiste
            if (detailIntervention) {
                setDetailIntervention({
                    ...detailIntervention,
                    notes_technicien: notesTechnicien,
                    rapport: rapport,
                });
            }

            Alert.alert("Succès", "Modifications enregistrées.");
            if (isEditingRapport) setIsEditingRapport(false);
        } catch (e: any) {
            console.error("Erreur sauvegarde :", e.response?.data || e.message);
            Alert.alert("Erreur", "Impossible d'enregistrer les modifications.");
        }
    };

    // Gestion du Check Matériel (Manquant dans ton snippet mais nécessaire)
    const toggleMaterialCheck = async (idDuMateriel: number | undefined, currentStatus: boolean | number | undefined) => {
        if (idDuMateriel === undefined) return;

        const isCheckedBool = currentStatus === 1 || currentStatus === true;
        const newStatus = !isCheckedBool;

        // Mise à jour Optimiste UI
        setMaterials(prevMaterials => prevMaterials.map(item => {
            const itemId = item.material_id || item.id;
            if (itemId === idDuMateriel) {
                return { ...item, is_checked: newStatus };
            }
            return item;
        }));

        const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/inventaires/${interventionId}/materials/${idDuMateriel}`;
        try {
            await axios.put(backendUrl, { is_checked: newStatus ? 1 : 0 },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
        } catch (e) {
            console.error("Erreur mise à jour check :", e);
            Alert.alert("Erreur", "Impossible de valider cet objet (Problème réseau)");
        }
    };

    // Clôture de l'intervention
    const cloturerInterv = async (finalStatut: InterventionStatus, signatureDirecte: string | null = null) => {

        // 1. Vérif Rapport
        if (!rapport || rapport.trim() === '') {
            Alert.alert("Rapport manquant", "Veuillez écrire un rapport avant de valider.");
            return;
        }

        // 2. Vérif Raison Echec
        let failureReasonToSend: string | null = null;
        if (finalStatut === 'echec') {
            if (!echecRaison || echecRaison.trim().length < 10) {
                Alert.alert("Précision requise", "Veuillez détailler la raison de l'échec (min 10 car.).");
                return;
            }
            failureReasonToSend = echecRaison;
        }

        // 3. Logique Signature
        let finalSignature: string | null = null;

        if (finalStatut === 'termine') {
            finalSignature = signatureDirecte || signatureData;

            if (!finalSignature) {
                setIsClotureModalVisible(false);
                setTimeout(() => {
                    setSignatureVisible(true);
                }, 500);
                return;
            }
        }

        // 4. Envoi API
        try {
            const backendUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/${interventionId}`;

            const dataToSend: any = {
                statut: finalStatut,
                notes_technicien: notesTechnicien,
                rapport: rapport,
                failure_reason: failureReasonToSend,
            };

            if (finalSignature) {
                dataToSend.signature = finalSignature;
            }

            await axios.put(backendUrl, dataToSend, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (detailIntervention) {
                setDetailIntervention({
                    ...detailIntervention,
                    statut: finalStatut,
                    rapport: rapport,
                    notes_technicien: notesTechnicien,
                    failure_reason: failureReasonToSend ?? undefined, // '?? undefined' pour TS
                    signature: finalSignature ?? undefined
                });
            }

            // Nettoyage
            setIsClotureModalVisible(false);
            setSignatureVisible(false);
            setIsFailing(false);
            setEchecRaison('');

            Alert.alert("Mission Clôturée", `L'intervention est maintenant en statut : ${finalStatut}`, [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);

        } catch (e: any) {
            console.error("Erreur Clôture :", e);
            const msg = e.response?.data?.message || "Erreur lors de la sauvegarde.";
            Alert.alert("Erreur", msg);
        }
    };

    // Archivage
    const archiverInterv = async () => {
        if (detailIntervention?.statut === "archiver") return;

        const proceed = async () => {
            const backUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/interventions/${interventionId}/archive`;

            try {
                await axios.patch(backUrl, {}, {
                    headers: { Authorization: `Bearer ${userToken}` },
                    timeout: 8000
                });

                if (detailIntervention) {
                    setDetailIntervention({ ...detailIntervention, statut: 'archiver' });
                }

                if (Platform.OS === 'web') {
                    alert("Succès : L'intervention a été archivée.");
                    navigation.goBack();
                } else {
                    Alert.alert("Succès", "L'intervention a été archivée.", [
                        { text: "OK", onPress: () => navigation.goBack() }
                    ]);
                }
            } catch (e) {
                if (Platform.OS === 'web') {
                    alert("Erreur : Impossible d'archiver.");
                } else {
                    Alert.alert("Erreur", "Impossible d'archiver cette intervention.");
                }
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Voulez-vous vraiment archiver cette intervention ?")) {
                proceed();
            }
        } else {
            Alert.alert(
                "Confirmation",
                "Voulez-vous vraiment archiver cette intervention ?",
                [
                    { text: "Annuler", style: "cancel" },
                    { text: "Archiver", style: "destructive", onPress: proceed }
                ]
            );
        }
    };

    // Helper pour la signature réussie
    const handleSignatureOK = (signature: string) => {
        setSignatureData(signature);
        setSignatureVisible(false);
        setTimeout(() => {
            cloturerInterv('termine', signature);
        }, 100);
    };

    // 3. RETURN : On expose tout ce dont la Vue a besoin
    return {
        // Données
        detailIntervention,
        materials,
        loading,
        isLoadingMaterials,

        // États variables (Valeurs des inputs)
        rapport, setRapport,
        notesTechnicien, setNotesTechnicien,
        echecRaison, setEchecRaison,

        // États UI (Visibilité modales, mode édition)
        isEditingRapport, setIsEditingRapport,
        isClotureModalVisible, setIsClotureModalVisible,
        isFailing, setIsFailing,
        isSignatureVisible, setSignatureVisible,

        // Variables calculées
        canEdit,
        isRapportModifiable,

        // Fonctions
        modifierRapportNotes,
        cloturerInterv,
        archiverInterv,
        toggleMaterialCheck,
        handleSignatureOK
    };
};