import {useEffect, useState} from "react";
import axios from "axios";
import type {Materiel as MaterielType} from "../../types/MaterielType.ts";

function Materiel() {
    const [materiel, setMateriel] = useState<MaterielType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMateriel = async () => {

        try {
            const response = await axios.get('http://localhost:3000/api/inventaires/', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            setMateriel(response.data);
            setLoading(false);
            console.log(response.data)
        } catch (e) {
            setError('Failed to fetch materiel.');
            console.error('Fetch materiel error:', e);
        }
    }
    useEffect(
        () => {
            fetchMateriel();
        }, []
    )

    if (loading) return <div className="page-container"><p>Chargement du stock...</p></div>;
    if (error) return <div className="page-container"><p style={{color: 'red'}}>{error}</p></div>;

    return (

        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>📦 Gestion du Stock</h1>
                    <p className="subtitle">Inventaire du matériel disponible</p>
                </div>
                <button className="btn-primary">+ Ajouter Matériel</button>
            </div>

            <div className="table-wrapper">
                <table className="clean-table">
                    <thead>
                    <tr>
                        <th>Référence</th>
                        <th>Nom du matériel</th>
                        <th>Quantité</th>
                        <th>Statut</th>
                        <th style={{textAlign: 'right'}}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {materiel.map((item) => (
                        <tr key={item.id}>
                            <td style={{fontFamily: 'monospace'}}>{item.reference || "N/A"}</td>
                            <td className="font-bold">{item.name}</td>
                            <td>{item.stock_quantity}</td>
                            <td>
                                <span className={`badge-role ${item.stock_quantity < 5 ? 'alert' : ''}`}
                                      style={{
                                          backgroundColor: item.stock_quantity < 5 ? '#ffebee' : '#e8f5e9',
                                          color: item.stock_quantity < 5 ? '#c62828' : '#2e7d32'
                                      }}>
                                        {item.stock_quantity > 0 ? 'En stock' : 'Rupture'}
                                    </span>
                            </td>
                            <td style={{textAlign: 'right'}}>
                                <button className="btn-icon edit">✏️</button>
                                <button className="btn-icon delete">🗑️</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>

    );
}

export default Materiel;