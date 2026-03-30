import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../service/axiosClient";
import type { Intervention } from "../../types/InterventionType.ts";
import type { Materiel } from "../../types/MaterielType.ts";
import type { User } from "../../types/AuthType.ts";

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
    statusBadge: (status: string) => ({
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '500',
        backgroundColor: status === 'prévu' ? '#eff6ff' : status === 'terminé' ? '#f0fdf4' : '#fef2f2',
        color: status === 'prévu' ? '#1d4ed8' : status === 'terminé' ? '#166534' : '#b91c1c',
    }),
    modalOverlay: {
        position: 'fixed' as const,
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
        padding: '1rem',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto' as const,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
    },
    formGroup: {
        marginBottom: '1rem',
    },
    label: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '0.4rem',
    },
    input: {
        width: '100%',
        padding: '0.625rem 0.875rem',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        fontSize: '0.875rem',
        outline: 'none',
        boxSizing: 'border-box' as const,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    }
};

function Interventions() {
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [materiel, setMateriel] = useState<Materiel[]>([]);
    const [technicians, setTechnicians] = useState<User[]>([]);

    const navigate = useNavigate();

    const [titre, setTitre] = useState('');
    const [nomClient, setNomClient] = useState('');
    const [date, setDate] = useState('');
    const [adresse, setAdresse] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMaterialId, setSelectedMaterialId] = useState<number | ''>('');
    const [quantiteSelectionnee, setQuantiteSelectionnee] = useState(1);
    const [technicianSelected, setTechnicianSelected] = useState<number[]>([]);
    const [listeIntervention, setListeIntervention] = useState<{id: number, name: string, quantity: number, toBring: boolean}[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resInter, resMat, resTech] = await Promise.all([
                axiosClient.get('/interventions/all'),
                axiosClient.get('/inventaires/'),
                axiosClient.get('/users/all')
            ]);
            setInterventions(resInter.data);
            setMateriel(resMat.data);
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
            if (quantiteSelectionnee > matFound.stock_quantity) {
                alert(`Stock insuffisant ! (Max: ${matFound.stock_quantity})`);
                return;
            }
            const nouvelObjet = { id: matFound.id, name: matFound.name, quantity: quantiteSelectionnee, toBring: true };
            setListeIntervention([...listeIntervention, nouvelObjet]);
            setSelectedMaterialId('');
            setQuantiteSelectionnee(1);
        }
    };

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
            await axiosClient.post('/interventions/addInterv', {
                interventionData: { titre, adresse, date, nomClient, description, statut: 'prévu' },
                materials: listeIntervention.map(m => ({ id: m.id, quantity: m.quantity, toBring: m.toBring })),
                technicianIds: technicianSelected
            });
            setIsModalOpen(false);
            setListeIntervention([]);
            setTechnicianSelected([]);
            fetchData();
            alert("Intervention créée !");
        } catch (err) {
            setError('Erreur lors de la création');
        }
    };

    if (loading) return <div style={{padding: '3rem', textAlign: 'center', color: '#6b7280'}}>Chargement...</div>;
    if (error) return <div style={{padding: '3rem', textAlign: 'center', color: '#b91c1c'}}>{error}</div>;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>Interventions</h1>
                    <p style={{color: '#6b7280', marginTop: '0.25rem'}}>Suivi et planification des missions</p>
                </div>
                <button style={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Nouvelle Mission
                </button>
            </header>

            <div style={styles.card}>
                <div style={{overflowX: 'auto'}}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Client / Titre</th>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Statut</th>
                                <th style={{...styles.th, textAlign: 'right'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {interventions.map(inter => (
                                <tr key={inter.id}>
                                    <td style={styles.td}>
                                        <div style={{fontWeight: '600', color: '#111827'}}>{inter.titre}</div>
                                        <div style={{fontSize: '0.75rem', color: '#6b7280'}}>👤 {inter.nomClient}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                            {new Date(inter.date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.statusBadge(inter.statut)}>{inter.statut}</span>
                                    </td>
                                    <td style={{...styles.td, textAlign: 'right'}}>
                                        <button 
                                            onClick={() => navigate(`/interventions/details/${inter.id}`)}
                                            style={{background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '500'}}
                                        >
                                            Voir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', margin: 0}}>Nouvelle Intervention</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280'}}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Titre</label>
                                <input style={styles.input} placeholder="Ex: Réparation Fibre" onChange={e => setTitre(e.target.value)} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Client</label>
                                <input style={styles.input} placeholder="Nom du client" onChange={e => setNomClient(e.target.value)} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Date</label>
                                <input style={styles.input} type="date" onChange={e => setDate(e.target.value)} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Adresse</label>
                                <input style={styles.input} placeholder="Adresse complète" onChange={e => setAdresse(e.target.value)} />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Description</label>
                            <textarea style={{...styles.input, height: '80px', resize: 'vertical'}} placeholder="Détails de l'intervention" onChange={e => setDescription(e.target.value)} />
                        </div>

                        <div style={{backgroundColor: '#f9fafb', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem'}}>
                            <h3 style={{fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                Matériel requis
                            </h3>
                            <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
                                <select style={{...styles.input, flex: 1}} value={selectedMaterialId} onChange={e => setSelectedMaterialId(Number(e.target.value))}>
                                    <option value="">Choisir matériel...</option>
                                    {materiel.map(m => <option key={m.id} value={m.id}>{m.name} (Stock: {m.stock_quantity})</option>)}
                                </select>
                                <input type="number" style={{...styles.input, width: '70px'}} value={quantiteSelectionnee} onChange={e => setQuantiteSelectionnee(Number(e.target.value))} />
                                <button style={{...styles.btnPrimary, padding: '0 1rem'}} onClick={ajouterMaterielALaListe}>+</button>
                            </div>
                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                                {listeIntervention.map((item, index) => (
                                    <div key={index} style={{backgroundColor: 'white', border: '1px solid #e5e7eb', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                        <span style={{fontWeight: '600'}}>{item.name} x{item.quantity}</span>
                                        <button 
                                            onClick={() => toggleToBring(index)}
                                            style={{border: 'none', background: item.toBring ? '#ffedd5' : '#dcfce7', color: item.toBring ? '#9a3412' : '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem'}}
                                        >
                                            {item.toBring ? 'À emporter' : 'Sur place'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{marginBottom: '1.5rem'}}>
                            <h3 style={{fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '1rem'}}>Équipe assignée</h3>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem'}}>
                                {technicians.map(t => (
                                    <label key={t.id} style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s'}}>
                                        <input
                                            type="checkbox"
                                            style={{width: '16px', height: '16px'}}
                                            onChange={() =>
                                                technicianSelected.includes(t.id)
                                                    ? setTechnicianSelected(technicianSelected.filter(id => id !== t.id))
                                                    : setTechnicianSelected([...technicianSelected, t.id])
                                            }
                                        />
                                        <span style={{fontSize: '0.875rem'}}>{t.nom}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f3f4f6'}}>
                            <button onClick={() => setIsModalOpen(false)} style={{background: 'none', border: 'none', color: '#6b7280', fontWeight: '500', cursor: 'pointer'}}>Annuler</button>
                            <button onClick={addIntervention} style={styles.btnPrimary}>Planifier la mission</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Interventions;
