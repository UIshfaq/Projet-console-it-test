import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../service/axiosClient";
import type { Intervention } from "../../types/InterventionType.ts";

const styles = {
    container: {
        padding: '2rem',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#1f2937',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
    },
    backButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'none',
        border: 'none',
        color: '#6b7280',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500',
        marginBottom: '1.5rem',
        padding: 0,
        transition: 'color 0.2s',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
    },
    title: {
        fontSize: '1.875rem',
        fontWeight: 'bold',
        color: '#111827',
        margin: 0,
    },
    badge: (status: string) => ({
        padding: '0.375rem 0.875rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'uppercase' as const,
        backgroundColor: status === 'termine' ? '#dcfce7' : status === 'echec' ? '#fef2f2' : '#eff6ff',
        color: status === 'termine' ? '#166534' : status === 'echec' ? '#991b1b' : '#1e40af',
    }),
    grid: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1.5rem',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
    },
    cardTitle: {
        fontSize: '1.125rem',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    infoRow: {
        display: 'flex',
        marginBottom: '1rem',
        fontSize: '0.875rem',
    },
    infoLabel: {
        width: '140px',
        color: '#6b7280',
        fontWeight: '500',
    },
    infoValue: {
        flex: 1,
        color: '#1f2937',
    },
    sectionTitle: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        marginBottom: '1rem',
        marginTop: '1.5rem',
        borderBottom: '1px solid #f3f4f6',
        paddingBottom: '0.5rem',
    },
    materialItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
    },
    techBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#f3f4f6',
        borderRadius: '6px',
        fontSize: '0.875rem',
        color: '#374151',
        marginRight: '0.5rem',
        marginBottom: '0.5rem',
    },
    signatureContainer: {
        marginTop: '1rem',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '1rem',
        textAlign: 'center' as const,
        backgroundColor: '#fff',
    },
    signatureImg: {
        maxWidth: '100%',
        maxHeight: '150px',
    },
    pdfButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.625rem 1.25rem',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: '1px solid #e5e7eb',
    },
    previewBtn: {
        backgroundColor: 'white',
        color: '#374151',
    },
    downloadBtn: {
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
    },
    emptyState: {
        color: '#9ca3af',
        fontStyle: 'italic',
        fontSize: '0.875rem',
    }
};

function InterventionDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [intervention, setIntervention] = useState<Intervention | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchApercuDownloadPdf = async (mode: 'preview' | 'download') => {
        try {
            const response = await axiosClient.get(`/generate-pdf/${id}`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            if (mode === 'preview') {
                window.open(url, '_blank');
            } else {
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `intervention_${id}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }

            setTimeout(() => window.URL.revokeObjectURL(url), 100);
            
        } catch (err) {
            console.error('Error fetching PDF:', err);
            alert("Erreur lors de la génération du PDF.");
        }
    };

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/interventions/details/${id}`);
                setIntervention(response.data);
            } catch (err) {
                console.error('Error fetching intervention details:', err);
                setError('Impossible de charger les détails de l\'intervention.');
            } finally {
                setLoading(false);
            }
        };


        if (id) fetchDetails();
    }, [id]);

    if (loading) return <div style={{padding: '3rem', textAlign: 'center', color: '#6b7280'}}>Chargement des détails...</div>;
    if (error || !intervention) return <div style={{padding: '3rem', textAlign: 'center', color: '#b91c1c'}}>{error || 'Intervention introuvable'}</div>;

    return (
        <div style={styles.container}>
            <button style={styles.backButton} onClick={() => navigate('/interventions')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Retour aux interventions
            </button>

            <header style={styles.header}>
                <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
                        <h1 style={styles.title}>{intervention.titre}</h1>
                        <span style={styles.badge(intervention.statut)}>{intervention.statut}</span>
                    </div>
                    <p style={{color: '#6b7280', margin: 0}}>Intervention #{intervention.id} • Créée le {intervention.created_at ? new Date(intervention.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>

                {(intervention.statut === 'termine' || intervention.statut === 'echec') && (
                    <div style={{display: 'flex', gap: '0.75rem'}}>
                        <button 
                            style={{...styles.pdfButton, ...styles.previewBtn}} 
                            onClick={() => fetchApercuDownloadPdf('preview')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            Aperçu PDF
                        </button>
                        <button 
                            style={{...styles.pdfButton, ...styles.downloadBtn}} 
                            onClick={() => fetchApercuDownloadPdf('download')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Télécharger PDF
                        </button>
                    </div>
                )}
            </header>

            <div style={styles.grid}>
                <div>
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            Informations Générales
                        </h2>
                        
                        <div style={styles.infoRow}>
                            <div style={styles.infoLabel}>Client</div>
                            <div style={{...styles.infoValue, fontWeight: '600'}}>{intervention.nomClient}</div>
                        </div>
                        <div style={styles.infoRow}>
                            <div style={styles.infoLabel}>Adresse</div>
                            <div style={styles.infoValue}>{intervention.adresse}</div>
                        </div>
                        <div style={styles.infoRow}>
                            <div style={styles.infoLabel}>Date prévue</div>
                            <div style={styles.infoValue}>{new Date(intervention.date).toLocaleDateString()}</div>
                        </div>
                        
                        <div style={styles.sectionTitle}>Description</div>
                        <p style={{fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.5'}}>
                            {intervention.description || <span style={styles.emptyState}>Aucune description fournie.</span>}
                        </p>

                        {(intervention.statut === 'termine' ) && (
                            <>
                                <div style={styles.sectionTitle}>Rapport d'intervention</div>
                                <div style={{backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem', color: '#1f2937', minHeight: '60px', whiteSpace: 'pre-wrap'}}>
                                    {intervention.rapport || <span style={styles.emptyState}>Aucun rapport renseigné.</span>}
                                </div>



                                {intervention.notes_technicien && (
                                    <>
                                        <div style={styles.sectionTitle}>Notes internes du technicien</div>
                                        <p style={{fontSize: '0.875rem', color: '#4b5563', fontStyle: 'italic'}}>
                                            {intervention.notes_technicien}
                                        </p>
                                    </>
                                )}
                            </>
                        )}

                        {intervention.statut === 'echec' && intervention.failure_reason && (
                            <>
                                <div style={{...styles.sectionTitle, color: '#991b1b', borderBottomColor: '#fee2e2'}}>Raison de l'échec</div>
                                <div style={{backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem', color: '#991b1b'}}>
                                    {intervention.failure_reason}
                                </div>
                            </>
                        )}
                    </div>

                    {intervention.signature && (
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>Signature Client</h2>
                            <div style={styles.signatureContainer}>
                                <img src={intervention.signature} alt="Signature du client" style={styles.signatureImg} />
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Techniciens</h2>
                        <div style={{display: 'flex', flexWrap: 'wrap'}}>
                            {intervention.technicians && intervention.technicians.length > 0 ? (
                                intervention.technicians.map((tech, index) => (
                                    <span key={tech.id || index} style={styles.techBadge}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '0.4rem'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        {tech.nom}
                                    </span>
                                ))
                            ) : (
                                <span style={styles.emptyState}>Aucun technicien assigné.</span>
                            )}
                        </div>
                    </div>

                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Matériel utilisé</h2>
                        {intervention.materials && intervention.materials.length > 0 ? (
                            intervention.materials.map((mat, idx) => (
                                <div key={idx} style={styles.materialItem}>
                                    <div>
                                        <div style={{fontWeight: '500'}}>{mat.name}</div>
                                        <div style={{fontSize: '0.75rem', color: '#6b7280'}}>
                                            {mat.to_bring ? '🚀 À emporter' : '📍 Sur place'}
                                        </div>
                                    </div>
                                    <div style={{fontWeight: '600', color: '#2563eb'}}>x{mat.quantity_required}</div>
                                </div>
                            ))
                        ) : (
                            <span style={styles.emptyState}>Aucun matériel listé.</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InterventionDetails;
