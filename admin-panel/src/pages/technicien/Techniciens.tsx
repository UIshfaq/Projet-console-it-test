import React, { useEffect, useState } from "react";
import axios from "axios";
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
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#eff6ff',
        color: '#2563eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        fontSize: '0.875rem',
    },
    statusBadge: (isActive: boolean) => ({
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '500',
        backgroundColor: isActive ? '#f0fdf4' : '#fef2f2',
        color: isActive ? '#166534' : '#b91c1c',
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
        maxWidth: '500px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
    },
    formGroup: {
        marginBottom: '1.25rem',
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
    }
};

const Techniciens: React.FC = () => {
    const [techniciens, setTechniciens] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const fetchTechniciens = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.get("http://localhost:3000/api/users/all", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const techs = response.data.filter((user: User) => user.role === "technicien");
            setTechniciens(techs);
        } catch (err) {
            setError("Erreur lors de la récupération des techniciens");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTechniciens();
    }, []);

    const handleAddTechnicien = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("adminToken");
            await axios.post("http://localhost:3000/auth/register", 
                { nom, email, password, phoneNumber, role: "technicien" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsModalOpen(false);
            setNom(""); setEmail(""); setPassword(""); setPhoneNumber("");
            fetchTechniciens();
        } catch (err) {
            alert("Erreur lors de l'ajout du technicien");
        }
    };

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem("adminToken");
            await axios.put(`http://localhost:3000/api/users/status/${id}`, 
                { isActive: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTechniciens();
        } catch (err) {
            alert("Erreur lors du changement de statut");
        }
    };

    if (loading) return <div style={{padding: '3rem', textAlign: 'center', color: '#6b7280'}}>Chargement...</div>;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>Techniciens</h1>
                    <p style={{color: '#6b7280', marginTop: '0.25rem'}}>Gestion des comptes et disponibilités</p>
                </div>
                <button style={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="16" y1="11" x2="22" y2="11"></line></svg>
                    Ajouter un Technicien
                </button>
            </header>

            {error && <div style={{backgroundColor: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fee2e2'}}>{error}</div>}

            <div style={styles.card}>
                <div style={{overflowX: 'auto'}}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Technicien</th>
                                <th style={styles.th}>Email / Téléphone</th>
                                <th style={styles.th}>Statut</th>
                                <th style={{...styles.th, textAlign: 'right'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {techniciens.map((tech) => (
                                <tr key={tech.id}>
                                    <td style={styles.td}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                                            <div style={styles.avatar}>{tech.nom.charAt(0)}</div>
                                            <div style={{fontWeight: '600', color: '#111827'}}>{tech.nom}</div>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{fontSize: '0.875rem', color: '#374151'}}>{tech.email}</div>
                                        <div style={{fontSize: '0.75rem', color: '#6b7280'}}>{tech.phoneNumber || 'N/A'}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.statusBadge(tech.isActive)}>
                                            {tech.isActive ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td style={{...styles.td, textAlign: 'right'}}>
                                        <button 
                                            onClick={() => toggleStatus(tech.id, tech.isActive)}
                                            style={{background: 'none', border: 'none', color: tech.isActive ? '#b91c1c' : '#16a34a', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem'}}
                                        >
                                            {tech.isActive ? 'Désactiver' : 'Activer'}
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
                            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', margin: 0}}>Nouveau Technicien</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280'}}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddTechnicien}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nom complet</label>
                                <input style={styles.input} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Jean Dupont" required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email</label>
                                <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jean@console-it.com" required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Téléphone</label>
                                <input style={styles.input} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="06 12 34 56 78" />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Mot de passe</label>
                                <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                            </div>

                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{background: 'none', border: 'none', color: '#6b7280', fontWeight: '500', cursor: 'pointer'}}>Annuler</button>
                                <button type="submit" style={styles.btnPrimary}>Créer le compte</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Techniciens;
