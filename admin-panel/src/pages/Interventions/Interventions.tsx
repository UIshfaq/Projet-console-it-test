import { useState, useEffect } from "react";
import axios from "axios";
import type { Intervention } from "../../types/InterventionType.ts";
import type { Materiel } from "../../types/MaterielType.ts";
import type { User } from "../../types/AuthType.ts";

function Interventions() {
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [materiel, setMateriel] = useState<Materiel[]>([]);
    const [technicians, setTechnicians] = useState<User[]>([]);

    // États du formulaire
    const [titre, setTitre] = useState('');
    const [nomClient, setNomClient] = useState('');
    const [date, setDate] = useState('');
    const [adresse, setAdresse] = useState('');
    const [description, setDescription] = useState('');

    // États de sélection
    const [selectedMaterialId, setSelectedMaterialId] = useState<number | ''>('');
    const [quantiteSelectionnee, setQuantiteSelectionnee] = useState(1);
    const [technicianSelected, setTechnicianSelected] = useState<number[]>([]);

    // Correction : La liste contient maintenant le statut "toBring" par objet
    const [listeIntervention, setListeIntervention] = useState<{id: number, name: string, quantity: number, toBring: boolean}[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const token = localStorage.getItem('adminToken');

    if (error) return <div className="p-10 text-red-600 font-bold">Erreur : {error}</div>; // Ajoute cette ligne !

    const fetchData = async () => {
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [resInter, resMat, resTech] = await Promise.all([
                axios.get('http://localhost:3000/api/interventions/all', { headers }),
                axios.get('http://localhost:3000/api/inventaires/', { headers }),
                axios.get('http://localhost:3000/api/users/all', { headers })
            ]);
            setInterventions(resInter.data);
            setMateriel(resMat.data);
            // On filtre pour n'avoir que les techniciens actifs
            setTechnicians(resTech.data.filter((u: User) => u.role === 'technicien'));
        } catch (err) {
            setError('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const ajouterMaterielALaListe = () => {
        if (selectedMaterialId === '') return;
        const matFound = materiel.find(m => m.id === Number(selectedMaterialId));

        if (matFound) {
            // Validation du stock en front-end [cite: 2026-01-08]
            if (quantiteSelectionnee > matFound.stock_quantity) {
                alert(`Stock insuffisant ! (Max: ${matFound.stock_quantity})`);
                return;
            }

            const nouvelObjet = {
                id: matFound.id,
                name: matFound.name,
                quantity: quantiteSelectionnee,
                toBring: true // Par défaut "À emporter"
            };
            setListeIntervention([...listeIntervention, nouvelObjet]);
            setSelectedMaterialId('');
            setQuantiteSelectionnee(1);
        }
    };

    // Basculer le statut "À emporter" pour un objet spécifique
    const toggleToBring = (index: number) => {
        const newList = [...listeIntervention];
        newList[index].toBring = !newList[index].toBring;
        setListeIntervention(newList);
    };

    const addIntervention = async () => {
        if (!titre || !adresse || !date || !nomClient || technicianSelected.length === 0) {
            alert('Champs obligatoires manquants.');
            return;
        }

        try {
            await axios.post('http://localhost:3000/api/interventions/addInterv', {
                interventionData: { titre, adresse, date, nomClient, description, statut: 'prévu' },
                materials: listeIntervention.map(m => ({ id: m.id, quantity: m.quantity, toBring: m.toBring })),
                technicianIds: technicianSelected
            }, { headers: { Authorization: `Bearer ${token}` } });

            setIsModalOpen(false);
            setListeIntervention([]);
            setTechnicianSelected([]);
            fetchData();
            alert("Intervention créée !");
        } catch (err) {
            setError('Erreur lors de la création');
        }
    };

    if (loading) return <div className="p-10">Chargement...</div>;

    return (
        <div className="page-container">
            <div className="page-header flex justify-between items-center mb-6">
                <h1>🛠️ Suivi des Interventions</h1>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Créer Intervention</button>
            </div>

            {/* Tableau simplifié pour l'exemple */}
            <div className="table-wrapper">
                <table className="clean-table w-full text-left border-collapse">
                    <thead>
                    <tr className="border-b">
                        <th>Client / Titre</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th className="text-right">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {interventions.map(inter => (
                        <tr key={inter.id} className="border-b hover:bg-gray-50">
                            <td className="py-3">
                                <div className="font-bold">{inter.titre}</div>
                                <div className="text-sm text-gray-500">{inter.nomClient}</div>
                            </td>
                            <td>{new Date(inter.date).toLocaleDateString()}</td>
                            <td><span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">{inter.statut}</span></td>
                            <td className="text-right">👁️</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Nouvelle Intervention</h2>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input className="border p-2 rounded" placeholder="Titre" onChange={e => setTitre(e.target.value)} />
                            <input className="border p-2 rounded" placeholder="Client" onChange={e => setNomClient(e.target.value)} />
                            <input className="border p-2 rounded" type="date" onChange={e => setDate(e.target.value)} />
                            <input className="border p-2 rounded" placeholder="Adresse" onChange={e => setAdresse(e.target.value)} />
                            <textarea className="border p-2 rounded col-span-2" placeholder="Description" onChange={e => setDescription(e.target.value)} />
                        </div>

                        {/* Matériel */}
                        <div className="mb-4 bg-gray-50 p-4 rounded">
                            <h3 className="font-bold text-sm mb-2">📦 Matériel requis</h3>
                            <div className="flex gap-2 mb-2">
                                <select className="flex-1 border p-2 rounded" value={selectedMaterialId} onChange={e => setSelectedMaterialId(Number(e.target.value))}>
                                    <option value="">Choisir matériel...</option>
                                    {materiel.map(m => <option key={m.id} value={m.id}>{m.name} (Stock: {m.stock_quantity})</option>)}
                                </select>
                                <input type="number" className="w-20 border p-2 rounded" value={quantiteSelectionnee} onChange={e => setQuantiteSelectionnee(Number(e.target.value))} />
                                <button className="bg-blue-600 text-white px-3 rounded" onClick={ajouterMaterielALaListe}>Ajouter</button>
                            </div>
                            <ul className="text-sm space-y-1">
                                {listeIntervention.map((item, index) => (
                                    <li key={index} className="flex justify-between items-center border-b pb-1">
                                        <span>{item.name} x{item.quantity}</span>
                                        <button
                                            onClick={() => toggleToBring(index)}
                                            className={`px-2 py-1 rounded text-xs ${item.toBring ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}
                                        >
                                            {item.toBring ? 'À emporter 🚗' : 'Sur place 🏠'}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Techniciens */}
                        <div className="mb-6">
                            <h3 className="font-bold text-sm mb-2">👥 Assigner l'équipe</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {technicians.map(t => (
                                    <label key={t.id} className="flex items-center gap-2 text-sm border p-2 rounded cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            onChange={() =>
                                                technicianSelected.includes(t.id)
                                                    ? setTechnicianSelected(technicianSelected.filter(id => id !== t.id))
                                                    : setTechnicianSelected([...technicianSelected, t.id])
                                            }
                                        />
                                        {t.nom}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button className="px-4 py-2 text-gray-500" onClick={() => setIsModalOpen(false)}>Annuler</button>
                            <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold" onClick={addIntervention}>Créer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Interventions;