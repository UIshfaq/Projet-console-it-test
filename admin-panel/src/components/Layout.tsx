import { Outlet, Link, useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // On nettoie tout et on part
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/');
    };

    return (
        <div className="admin-container">
            {/* --- SIDEBAR (Gauche) --- */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h3>Console IT</h3>
                </div>

                <nav className="sidebar-menu">
                    <Link to="/dashboard" className="menu-item">📊 Dashboard</Link>
                    <Link to="/techniciens" className="menu-item">👨‍🔧 Techniciens</Link>
                    <Link to="/interventions" className="menu-item">🛠️ Interventions</Link>
                    <Link to="/materiels" className="menu-item">💻 Matériels</Link>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">Déconnexion</button>
                </div>
            </aside>

            {/* --- CONTENU PRINCIPAL (Droite) --- */}
            <main className="main-content">
                {/* <Outlet /> est l'endroit magique où tes pages (Dashboard, etc.) vont s'afficher */}
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;