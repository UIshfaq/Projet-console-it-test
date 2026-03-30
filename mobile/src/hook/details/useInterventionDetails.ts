import { useState, useEffect, useContext } from 'react';
import axiosMobile from '../../api/axiosMobile';
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
        try {
            const response = await axiosMobile.get(`/interventions/${interventionId}`);
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
        try {
            const response = await axiosMobile.get(`/inventaires/${interventionId}/materials`);
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
        try {
            await axiosMobile.patch(`/interventions/${interventionId}/modifier`, {
                rapport: rapport,
                notes_technicien: notesTechnicien,
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
    // Dans useInterventionDetails.ts

    const toggleMaterialCheck = async (idDuMateriel: number | undefined, currentStatus: boolean | number | undefined) => {
        // 1. Sécurité ID
        if (idDuMateriel === undefined) {
            console.error("ID matériel manquant !");
            return;
        }

        // 2. Calcul du nouveau statut
        const isCheckedBool = currentStatus === 1 || currentStatus === true;
        const newStatus = !isCheckedBool;

        // 3. MISE À JOUR OPTIMISTE (On change l'écran tout de suite)
        // On sauvegarde l'ancien état au cas où ça plante
        const previousMaterials = [...materials];

        setMaterials(prevMaterials => prevMaterials.map(item => {
            const itemId = item.material_id || item.id;
            if (itemId === idDuMateriel) {
                return { ...item, is_checked: newStatus };
            }
            return item;
        }));

        // 4. ENVOI AU SERVEUR
        try {
            await axiosMobile.put(`/inventaires/${interventionId}/materials/${idDuMateriel}`, { is_checked: newStatus ? 1 : 0 });
            // Si on arrive ici, tout va bien, le serveur est synchro.
            // A mettre juste avant ton axios.put ou fetch
            console.log("🚀 URL appelée :", `/api/interventions/${interventionId}/materials/${idDuMateriel}`);
            console.log("📦 Données envoyées :", { is_checked: newStatus });
        } catch (e) {
            console.error("Erreur synchro check :", e);

            // 🚨 5. ROLLBACK : C'est ici que tu corriges le bug !
            // Si le serveur dit non, on remet la liste comme avant.
            setMaterials(previousMaterials);

            Alert.alert("Oups", "Problème de connexion, la case n'a pas été cochée.");
        }
    };

    // Clôture de l'intervention
    // ... dans useInterventionDetails.ts

    const cloturerInterv = async (finalStatut: InterventionStatus, signatureDirecte: string | null = null) => {

        // 1. --- LOGIQUE DE VALIDATION ---

        // CAS ÉCHEC : On vérifie la "Raison" de la modale
        if (finalStatut === 'echec') {
            if (!echecRaison || echecRaison.trim().length < 10) { // J'ai baissé à 5 caractères pour tester
                Alert.alert("Précision requise", "Veuillez donner une raison pour l'échec.");
                return;
            }
        }
        // CAS SUCCÈS : On vérifie le "Rapport" principal
        else {
            if (!rapport || rapport.trim() === '') {
                Alert.alert("Rapport manquant", "Veuillez écrire un rapport avant de valider.");
                return;
            }
        }

        // 2. --- GESTION DE LA SIGNATURE (Uniquement pour Succès) ---
        let finalSignature: string | null = null;

        if (finalStatut === 'termine') {
            finalSignature = signatureDirecte || signatureData;

            // Si pas de signature, on ouvre la modale et on stop
            if (!finalSignature) {
                setIsClotureModalVisible(false);
                setTimeout(() => {
                    setSignatureVisible(true);
                }, 500);
                return;
            }
        }

        // 3. --- ENVOI DES DONNÉES ---
        try {
            // ASTUCE : Si c'est un échec et que le rapport est vide, on utilise la raison comme rapport
            // Cela évite d'envoyer un rapport vide en BDD
            const rapportFinal = (finalStatut === 'echec' && (!rapport || rapport.trim() === ''))
                ? `[ÉCHEC] Motif : ${echecRaison}`
                : rapport;

            const dataToSend: any = {
                statut: finalStatut,
                notes_technicien: notesTechnicien,
                rapport: rapportFinal, // On envoie le rapport calculé
                failure_reason: (finalStatut === 'echec') ? echecRaison : null,
            };

            if (finalSignature) {
                dataToSend.signature = finalSignature;
            }

            await axiosMobile.put(`/interventions/${interventionId}`, dataToSend);

            // Mise à jour locale (Optimiste)
            if (detailIntervention) {
                setDetailIntervention({
                    ...detailIntervention,
                    statut: finalStatut,
                    rapport: rapportFinal,
                    notes_technicien: notesTechnicien,
                    failure_reason: dataToSend.failure_reason,
                    signature: finalSignature ?? undefined
                });
            }

            // Fermeture des modales et retour
            setIsClotureModalVisible(false);
            setSignatureVisible(false);
            setIsFailing(false);
            setEchecRaison('');

            Alert.alert(
                finalStatut === 'echec' ? "Déclaré en échec" : "Mission Terminée",
                "Le statut a été mis à jour.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );

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
            try {
                await axiosMobile.patch(`/interventions/${interventionId}/archive`, {}, {
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