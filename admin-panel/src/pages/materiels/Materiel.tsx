import {useEffect, useState} from "react";
import axiosClient from "../../service/axiosClient";
import type {Materiel as MaterielType} from "../../types/MaterielType.ts";

const styles = {
    container: {
        padding: '2rem',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#1f2937',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    title: {
        fontSize: '1.875rem',
        fontWeight: 'bold',
        color: '#111827',
        margin: 0,
    },
    btnPrimary: {
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '0.625rem 1.25rem',
        borderRadius: '8px',
        fontWeight: '600',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
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
    stockBadge: (quantity: number) => ({
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '500',
        backgroundColor: quantity === 0 ? '#fef2f2' : quantity < 10 ? '#fff7ed' : '#f0fdf4',
        color: quantity === 0 ? '#b91c1c' : quantity < 10 ? '#9a3412' : '#166534',
    }),
    iconBtn: {
        background: 'none',
        border: 'none',
        padding: '0.5rem',
        borderRadius: '6px',
        cursor: 'pointer',
        color: '#6b7280',
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
};

function Materiel() {
    const [materiel, setMateriel] = useState<MaterielType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMateriel = async () => {
        try {
            const response = await axiosClient.get('/inventaires/');
            setMateriel(response.data);
            setLoading(false);
        } catch (e) {
            setError('Impossible de charger l\'inventaire.');
            console.error('Fetch materiel error:', e);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMateriel();
    }, []);

    if (loading) return <div style={{padding: '3rem', textAlign: 'center', color: '#6b7280'}}>Chargement du stock...</div>;
    if (error) return <div style={{padding: '3rem', textAlign: 'center', color: '#b91c1c'}}>{error}</div>;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>Gestion du Stock</h1>
                    <p style={{color: '#6b7280', marginTop: '0.25rem'}}>Inventaire du matériel disponible en temps réel</p>
                </div>
                <button style={styles.btnPrimary}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Nouveau Matériel
                </button>
            </header>

            <div style={styles.card}>
                <div style={{overflowX: 'auto'}}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Référence</th>
                                <th style={styles.th}>Nom du matériel</th>
                                <th style={styles.th}>Quantité</th>
                                <th style={styles.th}>Statut</th>
                                <th style={{...styles.th, textAlign: 'right'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materiel.map((item) => (
                                <tr key={item.id}>
                                    <td style={{...styles.td, fontFamily: 'monospace', color: '#6b7280'}}>{item.reference || "REF-000"}</td>
                                    <td style={{...styles.td, fontWeight: '600', color: '#111827'}}>{item.name}</td>
                                    <td style={styles.td}>
                                        <span style={{fontWeight: '700'}}>{item.stock_quantity}</span> unités
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.stockBadge(item.stock_quantity)}>
                                            {item.stock_quantity === 0 ? 'Rupture' : item.stock_quantity < 10 ? 'Stock Faible' : 'En stock'}
                                        </span>
                                    </td>
                                    <td style={{...styles.td, textAlign: 'right'}}>
                                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '0.25rem'}}>
                                            <button style={styles.iconBtn} title="Modifier">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                            <button style={{...styles.iconBtn, color: '#ef4444'}} title="Supprimer">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Materiel;
