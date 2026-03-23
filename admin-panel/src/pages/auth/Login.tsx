import {useEffect, useState} from "react";
import axios from "axios";
import type {LoginResponse} from '../../types/AuthType.ts';
import { useNavigate } from "react-router-dom";

const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f4f7fa',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center' as const,
    },
    logo: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#2563eb',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    },
    title: {
        fontSize: '1.25rem',
        color: '#1f2937',
        fontWeight: '600',
        marginBottom: '0.25rem',
    },
    subtitle: {
        fontSize: '0.875rem',
        color: '#6b7280',
        marginBottom: '2rem',
    },
    form: {
        textAlign: 'left' as const,
    },
    formGroup: {
        marginBottom: '1.25rem',
    },
    label: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '0.5rem',
    },
    input: {
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        fontSize: '1rem',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        outline: 'none',
        boxSizing: 'border-box' as const,
    },
    button: {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '1rem',
        transition: 'background-color 0.2s',
    },
    error: {
        backgroundColor: '#fef2f2',
        color: '#b91c1c',
        padding: '0.75rem',
        borderRadius: '8px',
        fontSize: '0.875rem',
        marginBottom: '1rem',
        border: '1px solid #fee2e2',
    }
};

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError("Veuillez remplir tous les champs.");
            return;
        }

        try {
            const backUrl = 'http://localhost:3000/auth/login';
            const response = await axios.post<LoginResponse>(backUrl,{
                email: email,
                password: password
            });

            if (response.data.user.role !== 'admin') {
                setError("Accès refusé : Cet espace est réservé aux administrateurs.");
                return;
            }

            localStorage.setItem('adminToken', response.data.token);
            localStorage.setItem('adminUser', JSON.stringify(response.data.user));
            navigate('/dashboard');
        }
        catch (err) {
            setError('Identifiants invalides. Veuillez réessayer.');
            console.error('Login error:', err);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logo}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                    Console IT
                </div>
                <h1 style={styles.title}>Espace Admin</h1>
                <p style={styles.subtitle}>Gestion des interventions et techniciens</p>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@console-it.com"
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={styles.input}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        style={styles.button}
                    >
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
