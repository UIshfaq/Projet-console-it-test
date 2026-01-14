import {useState} from "react";
import axios from "axios";
import {useEffect} from "react";
import type {Intervention} from "../../types/InterventionType.ts";

function Interventions() {
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    useEffect(() => {
        fetchInterventions();
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
                <button className="btn-primary">+ Créer Intervention</button>
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

                                <td>{new Date(inter.date).toLocaleDateString()}</td>

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
        </div>
    );
}

export default Interventions;