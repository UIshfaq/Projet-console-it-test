const db = require('../db-connection')
const verifyToken = require('../middlewares/authMiddleware');

const getAllInventaires = async (req, res) => {
    try {
        const rows = await db('materials').select('*').orderBy( 'id','desc')
        res.status(200).json(rows)
    }

    catch (e) {
        console.error("Erreur lors de la récupération des inventaires :", e)
        res.status(500).json({ message: "Erreur serveur" })
    }
}


const addInventaire = async (req, res) => {
    try {
        const {name, reference, stock_quantity} = req.body

        const [newInventaireId] = await db('materials').insert({
            name,
            reference,
            stock_quantity: stock_quantity || 0
        })
        res.status(201).json({
            message: name + " a été ajouté avec succès",
            id: newInventaireId
        })
    } catch (e) {
        console.error("Erreur lors de l'ajout de l'inventaire :", e)
        res.status(500).json({message: "Erreur serveur"})
    }
}

const getMaterialsForIntervention = async (req,res) => {
    const interventionId = req.params.id
    const technicien_id = req.userId

    try{
        const rows = await db('intervention_materials')
            .join('materials', 'intervention_materials.material_id', '=', 'materials.id')
            .join('interventions', 'intervention_materials.intervention_id', '=', 'interventions.id')
            .select('quantity_required', 'to_bring','is_checked','materials.id as material_id','materials.name','materials.reference')
            .where('intervention_materials.intervention_id', interventionId)
            .andWhere('interventions.technicien_id', technicien_id);

        res.status(200).json(rows)
    }
    catch (e) {
        console.error("Erreur lors de la récupération des matériaux pour l'intervention :", e)
        res.status(500).json({message: "Erreur serveur"})
    }
}

module.exports = {
    getAllInventaires,
    addInventaire,
    getMaterialsForIntervention
}
