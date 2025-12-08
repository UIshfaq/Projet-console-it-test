const express = require('express');
const router = express.Router();
const db = require('../db-connection'); // Notre connexion BDD
const verifyToken = require('../middlewares/authMiddleware');
const {json, response, request} = require("express");

router.use(verifyToken);

router.get('/', async (req, res) => {
    try {

        const technicienIdConnecte = req.userId;

        const interventions = await db('interventions')
            .where({ technicien_id: technicienIdConnecte })
            .whereNotIn('statut', ['annule', 'archiver'])
            .orderBy('date', 'asc');

        res.status(200).json(interventions);

    } catch (e) {
        console.error("Erreur lors de la récupération des interventions:", e);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.get('/archived', async (req, res) => {

    const technicienIdConnecte = req.userId

    try {
        const interventionsArchivees = await db('interventions')
            .where({ statut : 'archiver', technicien_id : technicienIdConnecte })
            .orderBy('date', 'desc');

        if (interventionsArchivees.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(interventionsArchivees)

    }
    catch (e) {
        console.error("Erreur lors de la récupération des interventions archivées :", e)
        res.status(500).json({message : "Erreur serveur"})
    }
});

router.get('/:id', async (req, res) => {

    const intervId = req.params.id

    try {

        const interventionById = await db('interventions').where({id : intervId}).first()

        if (!interventionById)
        {
            return res.status(404).json({message : "L'intervention est introuvable"})
        }

        res.status(200).json(interventionById)

    }
    catch (e){
        console.log("Erreur lors de la récuperation des détails")
        res.status(500).json({message : "Erreur serveur"})

    }
})

router.put('/:id', async (req , res) => {

    const { id } = req.params;
    const { statut, rapport } = req.body;
    const technicienIdConnecte = req.userId;

    try {
        const rowsAffected = await db('interventions')
            .where({ id: id, technicien_id: technicienIdConnecte })
            .update({
                statut: statut,
                rapport: rapport
            });

        if (rowsAffected === 0) {
            return res.status(404).json({ message: "Intervention non trouvée ou non attribuée." });
        }

        res.json({ message: "Modification de l'intervention réussie" });

    } catch (e) {
        console.error("Erreur lors de l'update :", e);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

router.patch('/:id/archive', async (req,res)=>{
    const { id } = req.params

    const technicienIdConnecte = req.userId

    try{

        const rowsAffected = await db('interventions')
            .where({ id: id, technicien_id: technicienIdConnecte })
            .update({ statut :'archiver' });


        if (rowsAffected === 0) {
            return res.status(404).json({ message: "Intervention non trouvée ou non autorisée." });
        }


        res.status(200).json({ message : "L'intervention est archivée avec succès. "});

    }
    catch (e) {
        console.error("Erreur lors de l'archivage :", e);
        res.status(500).json({message : "Erreur serveur."})
    }
})


module.exports = router;
