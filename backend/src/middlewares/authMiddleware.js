const jwt = require('jsonwebtoken');

// Middleware pour vérifier la validité du JWT
const verifyToken = (req, res, next) => {
    // 1. Récupérer le jeton de l'en-tête Authorization
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Accès refusé. Jeton manquant.' });
    }

    // Isoler la chaîne du jeton
    const token = authHeader.split(' ')[1];

    // 2. Vérifier et décoder le jeton
    try {
        // Utilise la clé secrète pour vérifier l'authenticité
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attacher les données de l'utilisateur à la requête pour usage futur
        req.userId = decoded.userId;
        req.userRole = decoded.role;

        // Poursuivre vers la route
        next();

    } catch (err) {
        // Jeton invalide ou expiré
        console.error("Erreur de validation JWT:", err.message);
        return res.status(403).json({ message: 'Jeton invalide ou expiré.' });
    }
};

module.exports = verifyToken;