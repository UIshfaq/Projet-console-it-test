import {useState} from "react";
import axios from "axios";
import type {LoginResponse} from '../../types/auth.ts';
import { useNavigate } from "react-router-dom";


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (email==="" || password==="") {
            setError("Veuillez remplir tous les champs.");
            return;
        }

        if (password.trim()==="" && password.length < 12 && !/[!@#$%^&*(),.?":{}|<>]/.test(password)&& !/\d/.test(password)&& !/[A-Z]/.test(password)) {
            setError("Le mot de passe doit contenir au moins 12 caractères, une majuscule, un chiffre et un caractère spécial.");
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
                return; // On arrête tout, on ne sauvegarde rien !
            }




            localStorage.setItem('adminToken', response.data.token);
            localStorage.setItem('adminUser', JSON.stringify(response.data.user));
            navigate('/dashboard');        }
        catch (err) {
            setError('Login failed. Please check your credentials.');
            console.error('Login error:', err);
        }

    }

return (
    <div className="login-container">
        <div className="login-card">
            <h2>Admin Panel</h2>
            <p>Connectez-vous pour gérer les interventions</p>

            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@console-it.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Mot de passe</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="********"
                        required
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="login-btn">Se connecter</button>
            </form>
        </div>
    </div>
);
}

export default Login;
