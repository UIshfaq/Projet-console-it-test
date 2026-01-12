const db = require('../db-connection')

const getProfil = async (req, res) => {

    const userId = req.userId

    try {
        const user = await db('users')
            .where({ id: userId })
            .select('id', 'nom', 'email', 'phone_number', 'created_at')
            .first();

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.status(200).json(user);
    }
    catch (e) {
        console.error("Erreur lors de la récupération du profil utilisateur :", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    getProfil
}