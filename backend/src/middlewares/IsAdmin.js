const isAdmin = (req, res, next) => {
    // On utilise req.userRole car c'est ce que tu as défini dans ton authMiddleware
    if (req.userRole && req.userRole === 'admin') {
        next(); // C'est un admin, on continue vers le contrôleur
    } else {
        // C'est un technicien ou un rôle inconnu, on bloque
        return res.status(403).json({
            message: "Accès refusé. Droits administrateur requis pour cette action."
        });
    }
};

module.exports = isAdmin;