import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoutes = () => {
    // 1. On récupère le token
    const token = localStorage.getItem('adminToken');

    // 2. La Logique du Gardien
    // Si il y a un token ? <Outlet /> (Affiche la page demandée)
    // Sinon ? <Navigate to="/" /> (Redirige vers le Login)
    return (
        token ? <Outlet /> : <Navigate to="/" />
    );
};

export default PrivateRoutes;