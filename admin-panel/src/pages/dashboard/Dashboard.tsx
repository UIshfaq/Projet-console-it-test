import axios from "axios";
import {useEffect, useState} from "react";

function Dashboard () {

    const [interventions, setInterventions] = useState<any[]>([]);

    const fetchInterToday = async () => {

        const token = localStorage.getItem('adminToken');

        try {
            const response = await axios.get("http://192.168.1.52:3000/api/dashboard/admin/interventions/today", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setInterventions(response.data);
            console.log("Today's interventions:", response.data);
        } catch (error) {
            console.error("Error fetching today's interventions:", error);
        }
    }

    useEffect(() => {
        fetchInterToday();
    }, []);

    return (
        <div className="dashboard-content">
            <div className="card">
                <h2 className="card-title">📅 Missions d'aujourd'hui</h2>

                <div className="table-responsive">
                    <table className="dashboard-table">
                        <thead>
                        <tr>
                            <th>Intervention / Client</th>
                            <th>Technicien</th>
                            <th>Adresse</th>
                            <th>Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {interventions.length > 0 ? (
                            interventions.map((inter) => (
                                <tr key={inter.id}>
                                    <td>
                                        <div className="titre-inter">{inter.titre}</div>
                                        <div className="client-name text-small">👤 {inter.nomClient}</div>
                                    </td>
                                    <td className="tech-name">{inter.nomsTechniciens || 'Non assigné'}</td>
                                    <td className="adresse-text">{inter.adresse}</td>
                                    <td>
                                        <span className="badge badge-today">Aujourd'hui</span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td  className="empty-message">
                                    Aucune intervention prévue pour ce jour.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;