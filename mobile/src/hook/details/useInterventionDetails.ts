import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import axiosMobile from '../../api/axiosMobile';
import { useNetwork } from "../../contextes/NetworkContext";
import { Intervention, InterventionStatus } from '../../types/Intervention';
import { Material } from '../../types/Materiel';

// Import des services SQLite
import {
    getLocalInterventionById,
    getLocalMaterialsByInterventionId,
    updateLocalInterventionStatus,
    updateLocalMaterialCheck // Assure-toi de l'avoir ajouté dans database.ts
} from '../../services/database';

export const useInterventionDetails = (interventionId: number, navigation: any) => {
    const { isConnected } = useNetwork();

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
    const [isSignatureVisible, setSignatureVisible] = useState<boolean>(false);
    const [signatureData, setSignatureData] = useState<string | null>(null);

    // 1. CHARGEMENT DES DONNÉES (Priorité Local)
    const chargerDonnees = async () => {
        setLoading(true);
        setIsLoadingMaterials(true);
        try {
            // Lecture dans SQLite
            const data = await getLocalInterventionById(interventionId);
            if (data) {
                setDetailIntervention(data as unknown as Intervention);
                if (data.rapport) setRapport(data.rapport);
                if (data.notes_technicien) setNotesTechnicien(data.notes_technicien);

                // Chargement des matériaux locaux
                const localMaterials = await getLocalMaterialsByInterventionId(interventionId);
                setMaterials(localMaterials as unknown as Material[]);
            } else if (isConnected) {
                // Si pas de cache mais réseau, on tente un fetch classique
                const response = await axiosMobile.get(`/interventions/${interventionId}`);
                setDetailIntervention(response.data);
            }
        } catch (e) {
            console.error("Erreur chargement :", e);
        } finally {
            setLoading(false);
            setIsLoadingMaterials(false);
        }
    };

    useEffect(() => {
        chargerDonnees();
    }, [interventionId]);

    // 2. LOGIQUE MÉTIER

    const isFinalStatus = detailIntervention ? ['archiver', 'termine', 'echec'].includes(detailIntervention.statut) : false;
    const canEdit = !isFinalStatus;
    const isRapportModifiable = detailIntervention ? (['prévu', 'en_cours'].includes(detailIntervention.statut)) || isEditingRapport : false;

    // Mise à jour Rapport/Notes (Hybride)
    const modifierRapportNotes = async () => {
        try {
            // Sauvegarde locale (is_synced: 0)
            await updateLocalInterventionStatus(interventionId, {
                statut: detailIntervention?.statut || 'en_cours',
                rapport,
                notes_technicien: notesTechnicien,
                is_synced: 0
            });

            if (isConnected) {
                await axiosMobile.patch(`/interventions/${interventionId}/modifier`, { rapport, notes_technicien: notesTechnicien });
                await updateLocalInterventionStatus(interventionId, { statut: detailIntervention?.statut || 'en_cours', is_synced: 1 });
            }

            if (detailIntervention) setDetailIntervention({ ...detailIntervention, notes_technicien: notesTechnicien, rapport });
            Alert.alert("Succès", isConnected ? "Synchronisé." : "Enregistré en local.");
            setIsEditingRapport(false);
        } catch (e: any) {
            const backendMessage = e?.response?.data?.message;
            if (isConnected && backendMessage) {
                Alert.alert("Erreur API", backendMessage);
            } else {
                Alert.alert("Info", "Sauvegardé localement (en attente de réseau).");
            }
        }
    };

    const archiverInterv = async () => {
        if (detailIntervention?.statut === "archiver") return;

        const proceed = async () => {
            try {
                // 1. Mise à jour locale immédiate pour la réactivité
                await updateLocalInterventionStatus(interventionId, {
                    statut: 'archiver',
                    is_synced: 0
                });

                if (detailIntervention) {
                    setDetailIntervention({ ...detailIntervention, statut: 'archiver' });
                }

                // 2. Tentative de synchronisation si réseau disponible
                if (isConnected) {
                    await axiosMobile.patch(`/interventions/${interventionId}/archive`);
                    // Si succès, on marque comme synchronisé
                    await updateLocalInterventionStatus(interventionId, {
                        statut: 'archiver',
                        is_synced: 1
                    });
                }

                Alert.alert("Succès", "L'intervention a été archivée.", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);

            } catch (e) {
                console.error("Erreur archivage :", e);
                // On reste sur un succès local même si le serveur échoue
                Alert.alert("Info", "Archivé localement (sera synchronisé plus tard).", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            }
        };

        // Demande de confirmation
        Alert.alert(
            "Confirmation",
            "Voulez-vous vraiment archiver cette intervention ?",
            [
                { text: "Annuler", style: "cancel" },
                { text: "Archiver", style: "destructive", onPress: proceed }
            ]
        );
    };

    // Toggle Matériel (Hybride)
    const toggleMaterialCheck = async (materialId: number | undefined, currentStatus: any) => {
        if (!materialId) return;
        const newStatus = !(currentStatus === 1 || currentStatus === true);

        // Update UI immédiat
        setMaterials(prev => prev.map(m => (m.material_id === materialId || m.id === materialId) ? { ...m, is_checked: newStatus } : m));

        try {
            // Update Local
            await updateLocalMaterialCheck(materialId, newStatus ? 1 : 0);

            // Update Server
            if (isConnected) {
                await axiosMobile.put(`/inventaires/${interventionId}/materials/${materialId}`, { is_checked: newStatus ? 1 : 0 });
            }
        } catch (e) {
            console.error("Erreur toggle matériel:", e);
        }
    };

    // Clôture (Robuste)
    const cloturerInterv = async (finalStatut: InterventionStatus, signatureDirecte: string | null = null) => {
        const sig = (finalStatut === 'termine') ? (signatureDirecte || signatureData) : null;
        const rapportFinal = (finalStatut === 'echec' && !rapport) ? `[ÉCHEC] ${echecRaison}` : rapport;

        if (finalStatut === 'termine' && !sig) {
            Alert.alert("Signature requise", "Veuillez signer avant de clôturer la mission.");
            return;
        }

        try {
            // 1. SQL Local d'abord
            await updateLocalInterventionStatus(interventionId, {
                statut: finalStatut,
                rapport: rapportFinal,
                notes_technicien: notesTechnicien,
                failure_reason: finalStatut === 'echec' ? echecRaison : null,
                signature: sig,
                is_synced: 0
            });

            // 2. Push Serveur si possible
            if (isConnected) {
                await axiosMobile.put(`/interventions/${interventionId}`, {
                    statut: finalStatut,
                    notes_technicien: notesTechnicien,
                    rapport: rapportFinal,
                    failure_reason: finalStatut === 'echec' ? echecRaison : null,
                    signature: sig
                });
                await updateLocalInterventionStatus(interventionId, { statut: finalStatut, is_synced: 1 });
            }

            navigation.goBack();
        } catch (e: any) {
            const backendMessage = e?.response?.data?.message;
            if (isConnected && backendMessage) {
                Alert.alert("Erreur API", backendMessage);
            } else {
                Alert.alert("Hors-ligne", "Enregistré localement. La synchro se fera plus tard.");
            }
            navigation.goBack();
        }
    };

    const handleSignatureOK = (signature: string) => {
        setSignatureData(signature);
        setSignatureVisible(false);
        setTimeout(() => cloturerInterv('termine', signature), 100);
    };

    return {
        detailIntervention, materials, loading, isLoadingMaterials,
        rapport, setRapport, notesTechnicien, setNotesTechnicien, echecRaison, setEchecRaison,
        isEditingRapport, setIsEditingRapport, isClotureModalVisible, setIsClotureModalVisible,
        isFailing, setIsFailing, isSignatureVisible, setSignatureVisible,
        canEdit, isRapportModifiable,
        modifierRapportNotes, cloturerInterv, toggleMaterialCheck, handleSignatureOK,archiverInterv
    };
};