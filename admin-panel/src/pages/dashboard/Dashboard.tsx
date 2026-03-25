import axiosClient from "../../../api/axiosClient.ts";
import {useEffect, useState} from "react";

const styles = {
    container: {
        padding: '2rem',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#1f2937',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
    },
    header: {
        marginBottom: '2rem',
    },
    title: {
        fontSize: '1.875rem',
        fontWeight: 'bold',
        color: '#111827',
        margin: 0,
    },
    subtitle: {
        color: '#6b7280',
        fontSize: '1rem',
        marginTop: '0.25rem',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem',
    },
    statCard: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    statIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statInfo: {
        display: 'flex',
        flexDirection: 'column' as const,
    },
    statLabel: {
        fontSize: '0.875rem',
        color: '#6b7280',
        fontWeight: '500',
    },
    statValue: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#111827',
    },
    tableCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
    },
    tableHeader: {
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tableTitle: {
        fontSize: '1.125rem',
        fontWeight: '600',
        margin: 0,
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        textAlign: 'left' as const,
    },
    th: {
        backgroundColor: '#f9fafb',
        padding: '0.75rem 1.5rem',
        fontSize: '0.75rem',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        borderBottom: '1px solid #f3f4f6',
    },
    td: {
        padding: '1rem 1.5rem',
        fontSize: '0.875rem',
        color: '#374151',
        borderBottom: '1px solid #f3f4f6',
    },
    badge: {
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '500',
        backgroundColor: '#dcfce7',
        color: '#166534',
    },
    emptyState: {
        padding: '3rem',
        textAlign: 'center' as const,
        color: '#6b7280',
    }
};

function Dashboard () {
    const [interventions, setInterventions] = useState<any[]>([]);

    const fetchInterToday = async () => {
        try {
            const response = await axiosClient.get("/dashboard/admin/interventions/today");
            setInterventions(response.data);
        } catch (error) {
            console.error("Error fetching today's interventions:", error);
        }
    }

    useEffect(() => {
        fetchInterToday();
    }, []);

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Dashboard</h1>
                <p style={styles.subtitle}>Aperçu de l'activité du jour</p>
            </header>

            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={{...styles.statIcon, backgroundColor: '#eff6ff', color: '#2563eb'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <div style={styles.statInfo}>
                        <span style={styles.statLabel}>Techniciens</span>
                        <span style={styles.statValue}>12</span>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={{...styles.statIcon, backgroundColor: '#f0fdf4', color: '#16a34a'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <div style={styles.statInfo}>
                        <span style={styles.statLabel}>Terminées</span>
                        <span style={styles.statValue}>48</span>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={{...styles.statIcon, backgroundColor: '#fff7ed', color: '#ea580c'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <div style={styles.statInfo}>
                        <span style={styles.statLabel}>En cours</span>
                        <span style={styles.statValue}>{interventions.length}</span>
                    </div>
                </div>
            </div>

            <div style={styles.tableCard}>
                <div style={styles.tableHeader}>
                    <h2 style={styles.tableTitle}>Missions d'aujourd'hui</h2>
                </div>

                <div style={{overflowX: 'auto'}}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Intervention / Client</th>
                                <th style={styles.th}>Technicien</th>
                                <th style={styles.th}>Adresse</th>
                                <th style={styles.th}>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {interventions.length > 0 ? (
                                interventions.map((inter) => (
                                    <tr key={inter.id}>
                                        <td style={styles.td}>
                                            <div style={{fontWeight: '600', color: '#111827'}}>{inter.titre}</div>
                                            <div style={{fontSize: '0.75rem', color: '#6b7280'}}>👤 {inter.nomClient}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                                <div style={{width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem'}}>
                                                    {inter.nomsTechniciens?.charAt(0) || '?'}
                                                </div>
                                                {inter.nomsTechniciens || 'Non assigné'}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                                {inter.adresse}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.badge}>Aujourd'hui</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} style={styles.emptyState}>
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
