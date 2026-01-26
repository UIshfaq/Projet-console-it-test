import {useEffect, useState} from "react";
import axios from "axios";
import type {User} from "../../types/AuthType.ts";


function techniciens() {

    const [technicians, setTechnicians] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    const [newTech, setNewTech] = useState({
        nom: '',
        email: '',
        password: '',
        role: 'technicien' as 'technicien' | 'admin',
        phone_number: ''
    });

    const token = localStorage.getItem('adminToken')

    const fetchTechnicians = async () => {



        try {
            const backendUrl = "http://localhost:3000/api/users/all";
            const response = await axios(backendUrl, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const techsOnly = response.data.filter((user: User) => user.role === 'technicien');
            setTechnicians(techsOnly);
            setLoading(false);

        } catch (e) {
            setError('Failed to fetch technicians.');
            console.error('Fetch technicians error:', e);
        }
    };

    const handleDelete = async (id: number) => {

        const confirmation = window.confirm("Voulez-vous vraiment désactiver ce compte ?");
        if (!confirmation) return;
        try {
            await axios.delete(`http://localhost:3000/api/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Technicien désactivé !");
            fetchTechnicians();
        } catch (err) {
            console.error("Erreur suppression:", err);
        }
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post("http://localhost:3000/auth/register", newTech, {
                headers: {Authorization: `Bearer ${token}`} // Vérifié par isAdmin côté back
            });

            setShowModal(false); // Ferme la modale
            setNewTech({nom: '', email: '', password: '', role: 'technicien',phone_number: ''}); // Reset
            fetchTechnicians(); // Rafraîchit ton tableau
            alert("Technicien ajouté !");
        } catch (err) {
            alert("Erreur lors de l'ajout");
        }
    };
    useEffect(() => {
        fetchTechnicians();
    }, []);

    if (loading) return <div className="loading-spinner">Chargement...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Gestion des Techniciens</h1>
                    <p className="subtitle">Gérez vos équipes et leurs accès</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    + Nouveau Technicien
                </button>
            </div>

            <div className="table-wrapper">
                <table className="clean-table">
                    <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Rôle</th>
                        <th style={{textAlign: 'right'}}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {technicians.map((tech) => (
                        <tr key={tech.id}>
                            <td className="font-bold">{tech.nom}</td>
                            <td>{tech.email}</td>
                            <td>{tech.phone_number || "Non renseigné"}</td>
                            <td>
                                <span className="badge-role">Technicien</span>
                            </td>
                            <td style={{textAlign: 'right'}}>
                                <button className="btn-icon edit" title="Modifier">✏️</button>
                                <button
                                    className="btn-icon delete"
                                    title="Supprimer"
                                    onClick={() => handleDelete(tech.id)}
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Ajouter un Technicien</h2>
                            <form onSubmit={handleAddSubmit}>
                                <input
                                    type="text" placeholder="Nom" required
                                    value={newTech.nom}
                                    onChange={e => setNewTech({...newTech, nom: e.target.value})}
                                />
                                <input
                                    type="email" placeholder="Email" required
                                    value={newTech.email}
                                    onChange={e => setNewTech({...newTech, email: e.target.value})}
                                />
                                <input
                                    type="password" placeholder="Mot de passe" required
                                    value={newTech.password}
                                    onChange={e => setNewTech({...newTech, password: e.target.value})}
                                />

                                <input
                                    type="text" placeholder="Numéro de téléphone" required
                                    value={newTech.phone_number}
                                    onChange={e => setNewTech({...newTech, phone_number: e.target.value})}
                                />

                                <div className="input-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Attribuer un rôle
                                    </label>
                                    <select
                                        value={newTech.role}
                                        onChange={(e) => setNewTech({...newTech, role: e.target.value as 'admin' | 'technicien'})}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="technicien">Technicien (Accès Mobile)</option>
                                        <option value="admin">Administrateur (Accès Web)</option>
                                    </select>
                                </div>

                                <div className="modal-buttons">
                                    <button type="button" onClick={() => setShowModal(false)}>Annuler</button>
                                    <button type="submit" className="btn-primary">Créer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}




                {technicians.length === 0 && (
                    <div className="empty-state">Aucun technicien trouvé.</div>
                )}
            </div>
        </div>
    );
}

export default techniciens;