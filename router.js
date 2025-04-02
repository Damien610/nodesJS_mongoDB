/**
 * @swagger
 * tags:
 *   name: Potions
 *   description: Gestion des potions magiques
 */

const express = require('express');
const router = express.Router();
const Potion = require('./potion.model');
const authMiddleware = require('./middleware')
/**
 * @swagger
 * /potions:
 *   get:
 *     summary: Récupérer toutes les potions
 *     tags: [Potions]
 *     responses:
 *       200:
 *         description: Liste des potions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Potion'
 */

router.get('/', async (req, res) => {
    try {
      const potions = await Potion.find();
      res.json(potions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
/**
 * @swagger
 * /potions/names:
 *   get:
 *     summary: Récupérer uniquement les noms des potions
 *     tags: [Potions]
 *     responses:
 *       200:
 *         description: Liste des noms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 example: Potion de soin
 */

  router.get('/names', async (req, res) => {
    try {
        const names = await Potion.find({}, 'name');
        res.json(names.map(p => p.name)); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
/**
 * @swagger
 * /potions/vendor/{vendor_id}:
 *   get:
 *     summary: Récupérer les potions par vendeur
 *     tags: [Potions]
 *     parameters:
 *       - in: path
 *         name: vendor_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du vendeur
 *     responses:
 *       200:
 *         description: Liste des potions du vendeur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Potion'
 */

router.get('/vendor/:vendor_id', async (req, res) => {
    try {
        const potions = await Potion.find({ vendor_id: req.params.vendor_id });
        console.log(potions);
        res.json(potions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
/**
 * @swagger
 * /potions/price-range:
 *   get:
 *     summary: Récupérer les potions dans une fourchette de prix
 *     tags: [Potions]
 *     parameters:
 *       - in: query
 *         name: min
 *         schema:
 *           type: number
 *         required: false
 *         description: Prix minimum
 *       - in: query
 *         name: max
 *         schema:
 *           type: number
 *         required: false
 *         description: Prix maximum
 *     responses:
 *       200:
 *         description: Potions dans la fourchette demandée
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Potion'
 */

router.get('/price-range', async (req, res) => {
    const min = parseFloat(req.query.min);
    const max = parseFloat(req.query.max);

    const priceFilter = {};

    if (!isNaN(min)) priceFilter.$gte = min;
    if (!isNaN(max)) priceFilter.$lte = max;

    const query = Object.keys(priceFilter).length > 0 ? { price: priceFilter } : {};

    try {
        const potions = await Potion.find(query);
        res.json(potions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /potions : créer une nouvelle potion
/**
 * @swagger
 * /potions:
 *   post:
 *     summary: Crée une nouvelle potion.
 *     tags:
 *       - Potions
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de la potion.
 *               price:
 *                 type: number
 *                 description: Prix de la potion.
 *               score:
 *                 type: number
 *                 description: Score de la potion.
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Ingrédients de la potion.
 *               ratings:
 *                 type: object
 *                 properties:
 *                   strength:
 *                     type: number
 *                   flavor:
 *                     type: number
 *               tryDate:
 *                 type: string
 *                 format: date
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               vendor_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Potion créée avec succès.
 *       400:
 *         description: Erreur de validation.
 *       500:
 *         description: Erreur serveur.
 */

router.post('/', authMiddleware, async (req, res) => {
    try {
        const newPotion = new Potion(req.body);
        const savedPotion = await newPotion.save();
        res.status(201).json(savedPotion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @swagger
 * /potions/{id}:
 *   post:
 *     summary: Modifier une potion (via POST)
 *     tags: [Potions]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la potion à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Champs de la potion à modifier (partiels ou complets)
 *     responses:
 *       200:
 *         description: Potion mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Potion'
 *       404:
 *         description: Potion non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.post('/:id', authMiddleware, async (req, res) => {
    try {
      const updatedPotion = await Potion.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true } // retourne la potion mise à jour
      );
  
      if (!updatedPotion) {
        return res.status(404).json({ error: 'Potion non trouvée' });
      }
  
      res.json(updatedPotion);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
 * @swagger
 * /potions/{id}:
 *   delete:
 *     summary: Supprimer une potion
 *     tags: [Potions]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la potion à supprimer
 *     responses:
 *       200:
 *         description: Potion supprimée
 *       404:
 *         description: Potion non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
      const deleted = await Potion.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Potion non trouvée" });
      res.json({ message: 'Potion supprimée' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
 * @swagger
 * /potions/{id}:
 *   get:
 *     summary: Récupérer une potion par son ID
 *     tags: [Potions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la potion à récupérer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la potion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Potion'
 *       404:
 *         description: Potion non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', async (req, res) => {
    try {
      const potion = await Potion.findById(req.params.id);
      if (!potion) {
        return res.status(404).json({ error: 'Potion non trouvée' });
      }
      res.json(potion);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

module.exports = router;