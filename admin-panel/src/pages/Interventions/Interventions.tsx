import {useState} from "react";
import axios from "axios";
import {useEffect} from "react";
import type {Intervention} from "../../types/InterventionType.ts";
import type {Materiel} from "../../types/MaterielType.ts";
import type {User} from "../../types/AuthType.ts";


function Interventions() {
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [materiel, setMateriel] = useState<Materiel[]>([]);


    const [titre, setTitre] = useState('');
    const [adresse, setAdresse] = useState('');
    const [date, setDate] = useState('');
    const [nomClient, setNomClient] = useState('');


    const [selectedMaterialId, setSelectedMaterialId] = useState<number | ''>('');
    const [quantiteSelectionnee, setQuantiteSelectionnee] = useState(1);
    const [listeIntervention, setListeIntervention] = useState<{id: number, name: string, quantity: number}[]>([]);

    const [technicians, setTechnicians] = useState<User[]>([]);
    const [technicianSelected, setTechnicianSelected] = useState<number[]>([]);

    // État pour afficher ou masquer le modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchTechnicians = async () => {

        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get('http://localhost:3000/api/users/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLoading(false);
            setTechnicians(response.data);
        }
        catch (e) {
            setError('Failed to fetch technicians.');
            console.error('Fetch technicians error:', e);
        }
    }


    const fetchMateriel = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/inventaires/', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            setMateriel(response.data);
        } catch (err) {
            console.error('Erreur lors de la récupération du matériel:', err);
        }

    }

    // 2. Fonction pour récupérer les données
    const fetchInterventions = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            // Vérifie bien ta route (api/interventions ou juste interventions)
            const response = await axios.get('http://localhost:3000/api/interventions/all', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Sécurité anti-crash
            if (Array.isArray(response.data)) {
                setInterventions(response.data);
            } else if (Array.isArray(response.data.data)) {
                setInterventions(response.data.data);
            } else {
                setInterventions([]);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Erreur lors du chargement des interventions');
            setLoading(false);
        }
    };

    const addIntervention = async () => {
        try {
            const backUrl = 'http://localhost:3000/api/interventions/addInterv';
            const token = localStorage.getItem('adminToken');

            // Correction 1 : On mappe la liste sélectionnée par l'admin, pas tout le stock
            const materialsForBackend = listeIntervention.map(m => ({
                id: m.id,
                quantity: m.quantity // On utilise la vraie quantité choisie
            }));

            // DANS TON FICHIER REACT
            await axios.post(backUrl, {
                interventionData: {
                    titre,
                    adresse,
                    date,
                    nomClient,
                    statut: 'prévu',
                    description: "Nouvelle intervention"
                    // SUPPRIME technicien_id d'ici !
                },
                materials: materialsForBackend,
                technicianIds: technicianSelected // ENVOIE-LE ICI (au pluriel, hors de interventionData)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Mise à jour de l'affichage
            await fetchInterventions();

            // Fermeture et reset
            setIsModalOpen(false);
            setListeIntervention([]);

        } catch (err) {
            console.error(err);
            setError('Erreur lors de la création de l\'intervention');
        }
    };


    const ajouterMaterielALaListe = () => {
        if (selectedMaterialId === '') return;

        // On cherche le nom du matériel dans notre stock global (materiel)
        const matFound = materiel.find(m => m.id === Number(selectedMaterialId));

        if (matFound) {
            const nouvelObjet = {
                id: matFound.id,
                name: matFound.name,
                quantity: quantiteSelectionnee
            };
            setListeIntervention([...listeIntervention, nouvelObjet]);

            // Reset des sélecteurs après l'ajout
            setSelectedMaterialId('');
            setQuantiteSelectionnee(1);
        }
    };

    const handleToggleTech = (techId: number) => {
        if (technicianSelected.includes(techId)) {
            setTechnicianSelected(technicianSelected.filter(id => id !== techId));
        } else {
            setTechnicianSelected([...technicianSelected, techId]);
        }
    };
    useEffect(() => {
        fetchInterventions();
        fetchMateriel();
        fetchTechnicians();
    }, []);

    // 3. Petite fonction pour les couleurs des badges selon ton ENUM SQL
    const getStatusStyle = (statut: string) => {
        switch(statut) {
            case 'termine': return { bg: '#d4edda', col: '#155724', label: 'Terminé ✅' };
            case 'en_cours': return { bg: '#cce5ff', col: '#004085', label: 'En Cours ⏳' };
            case 'prévu': return { bg: '#fff3cd', col: '#856404', label: 'Prévu 📅' };
            case 'echec': return { bg: '#f8d7da', col: '#721c24', label: 'Échec ❌' };
            case 'annule': return { bg: '#e2e3e5', col: '#383d41', label: 'Annulé 🚫' };
            default: return { bg: '#eee', col: '#333', label: statut };
        }
    };

    if (loading) return <div className="page-container"><p>Chargement...</p></div>;
    if (error) return <div className="page-container"><p style={{color:'red'}}>{error}</p></div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>🛠️ Suivi des Interventions</h1>
                    <p className="subtitle">Planning et historique</p>
                </div>
                <button className="btn-primary"
                onClick={()=>setIsModalOpen(true)}
                >+ Créer Intervention</button>
            </div>

            <div className="table-wrapper">
                <table className="clean-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Intervention / Client</th>
                        <th>Date</th>
                        <th>Adresse</th>
                        <th>Statut</th>
                        <th style={{textAlign: 'right'}}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {interventions.map((inter) => {
                        const style = getStatusStyle(inter.statut);
                        return (
                            <tr key={inter.id}>
                                <td>#{inter.id}</td>

                                {/* Titre en gras, Client en petit en dessous */}
                                <td>
                                    <div className="font-bold">{inter.titre}</div>
                                    <div style={{fontSize: '0.85rem', color: '#666'}}>
                                        👤 {inter.nomClient || 'Client inconnu'}
                                    </div>
                                </td>

                                <td>{inter.date ? new Date(inter.date).toLocaleDateString() : 'Date absente'}</td>

                                <td style={{fontSize: '0.9rem'}}>{inter.adresse}</td>

                                <td>
                                        <span className="badge-role" style={{backgroundColor: style.bg, color: style.col}}>
                                            {style.label}
                                        </span>
                                </td>

                                <td style={{textAlign: 'right'}}>
                                    <button className="btn-icon edit" title="Voir détails">👁️</button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
                {interventions.length === 0 && <p style={{padding:20}}>Aucune intervention trouvée.</p>}
            </div>

            {isModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div
                            className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">

                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h2 className="text-xl font-bold">Nouvelle Intervention</h2>
                                <button onClick={() => setIsModalOpen(false)}
                                        className="text-gray-500 hover:text-red-500">✕
                                </button>
                            </div>

                            {/* --- Tes Inputs ici --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="border p-2 rounded" placeholder="Titre" value={titre}
                                       onChange={(e) => setTitre(e.target.value)}/>
                                <input className="border p-2 rounded" placeholder="Nom Client" value={nomClient}
                                       onChange={(e) => setNomClient(e.target.value)}/>
                                <input className="border p-2 rounded" type="date" value={date}
                                       onChange={(e) => setDate(e.target.value)}/>
                                <input className="border p-2 rounded" placeholder="Adresse" value={adresse}
                                       onChange={(e) => setAdresse(e.target.value)}/>
                            </div>

                            <div className="mt-6 border-t pt-4">
                                <h3 className="font-semibold mb-2 text-blue-600">Sélection du Matériel</h3>
                                <div className="flex gap-2">
                                    <select
                                        value={selectedMaterialId}
                                        onChange={(e) => setSelectedMaterialId(Number(e.target.value))}

                                    >
                                        <option value="">-- Choisir un matériel --</option>

                                        {materiel.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} (Stock actuel : {item.stock_quantity})
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        type="number"
                                        min="1"
                                        value={quantiteSelectionnee}
                                        onChange={(e) => setQuantiteSelectionnee(Number(e.target.value))}/>

                                    <button onClick={ajouterMaterielALaListe}>Ajouter à la liste</button>
                                </div>

                                {/* Affichage de la liste temporaire avant envoi */}
                                <ul className="mt-2 space-y-1">
                                    {listeIntervention.map((item) => (
                                        // On utilise item.id comme clé unique ici
                                        <li key={item.id}
                                            className="text-sm bg-gray-50 p-2 rounded flex justify-between">
                                            <span>{item.name}</span>
                                            <span className="font-bold text-blue-600">x {item.quantity}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>


                            <div className="assign-container mt-4 border-t pt-4">
                                <label className="font-semibold mb-2 block text-blue-600">Assigner l'équipe :</label>

                                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded border">
                                    {technicians.map((tech) => (
                                        <div key={tech.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`tech-${tech.id}`}
                                                checked={technicianSelected.includes(tech.id)}
                                                onChange={() => handleToggleTech(tech.id)}
                                                className="w-4 h-4"/>
                                            <label htmlFor={`tech-${tech.id}`} className="text-sm cursor-pointer">
                                                {tech.nom}
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <div className="text-xs text-gray-500 mt-2 italic">
                                    {technicianSelected.length} technicien(s) sélectionné(s)
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button className="btn-secondary mr-2" onClick={() => setIsModalOpen(false)}>Annuler</button>
                        <button className="btn-primary" onClick={addIntervention}>Créer Intervention</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Interventions;