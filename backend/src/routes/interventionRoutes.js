const express = require('express');
const router = express.Router();
const db = require('../db-connection'); // Notre connexion BDD
const verifyToken = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', async (req, res) => {
    try {

        const technicienIdConnecte = req.userId;

        const interventions = await db('interventions')
            .where({ technicien_id: technicienIdConnecte })
            .orderBy('date', 'asc');

        res.status(200).json(interventions);

    } catch (e) {
        console.error("Erreur lors de la récupération des interventions:", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;
