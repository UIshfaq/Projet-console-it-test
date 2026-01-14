import {useEffect, useState} from "react";
import axios from "axios";
import type {User} from "../../types/AuthType.ts";


function techniciens () {

    const [technicians, setTechnicians] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

            console.log('Fetched technicians:', techsOnly);
        }
        catch (e){
            setError('Failed to fetch technicians.');
            console.error('Fetch technicians error:', e);
        }
    };

    useEffect(() => {
        fetchTechnicians();
    }, []);

    if (loading) return <div className="loading-spinner">Chargement...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="page-container">
            {/* 1. L'En-tête de la page */}
            <div className="page-header">
                <div>
                    <h1>Gestion des Techniciens</h1>
                    <p className="subtitle">Gérez vos équipes et leurs accès</p>
                </div>
                <button className="btn-primary">
                    + Nouveau Technicien
                </button>
            </div>

            {/* 2. Le Tableau de données */}
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
                                <button className="btn-icon delete" title="Supprimer">🗑️</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {technicians.length === 0 && (
                    <div className="empty-state">Aucun technicien trouvé.</div>
                )}
            </div>
        </div>
    );
}

export default techniciens;