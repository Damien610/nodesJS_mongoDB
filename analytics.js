/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Statistiques et agrégations sur les potions
 */

const express = require('express');
const analytics = express.Router();
const Potion = require('./potion.model');

/**
 * @swagger
 * /analytics/distinct-categories:
 *   get:
 *     summary: Récupère toutes les catégories uniques de potions
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Catégories distinctes retournées avec leur nombre
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *                   example: 5
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: Défense
 */

analytics.get('/distinct-categories', async (req, res) => {
    try {
      const categories = await Potion.distinct('categories');
      res.json({ count: categories.length, categories });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
/**
 * @swagger
 * /analytics/average-score-by-vendor:
 *   get:
 *     summary: Score moyen des potions par vendeur
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Liste des vendeurs avec score moyen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 6437b61e5db11573cfe933b0
 *                   averageScore:
 *                     type: number
 *                     example: 4.7
 */

  analytics.get('/average-score-by-vendor', async (req, res) => {
    try {
      const result = await Potion.aggregate([
        {
          $group: {
            _id: '$vendor_id',
            averageScore: { $avg: '$score' }
          }
        }
      ]);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
 * @swagger
 * /analytics/average-score-by-category:
 *   get:
 *     summary: Score moyen des potions par catégorie
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Score moyen pour chaque catégorie
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: Attaque
 *                   averageScore:
 *                     type: number
 *                     example: 3.9
 */

  analytics.get('/average-score-by-category', async (req, res) => {
    try {
      const result = await Potion.aggregate([
        { $unwind: '$categories' },
        {
          $group: {
            _id: '$categories',
            averageScore: { $avg: '$score' }
          }
        }
      ]);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
/**
 * @swagger
 * /analytics/strength-flavor-ratio:
 *   get:
 *     summary: Calcule le ratio force/arôme pour chaque potion
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Liste des potions avec leur ratio
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Potion de feu
 *                   strengthFlavorRatio:
 *                     type: number
 *                     example: 2.5
 */

  analytics.get('/strength-flavor-ratio', async (req, res) => {
    try {
      const result = await Potion.aggregate([
        {
          $project: {
            name: 1,
            strengthFlavorRatio: {
              $cond: [
                { $eq: ['$ratings.flavor', 0] },
                null,
                { $divide: ['$ratings.strength', '$ratings.flavor'] }
              ]
            }
          }
        }
      ]);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
/**
 * @swagger
 * /analytics/search:
 *   get:
 *     summary: Recherche personnalisée via agrégation dynamique
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *         required: true
 *         example: vendor_id
 *         description: Champ pour grouper (ex: vendor_id, categories)
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [avg, sum, count]
 *         required: true
 *         example: avg
 *         description: Type d'agrégation
 *       - in: query
 *         name: field
 *         schema:
 *           type: string
 *         required: false
 *         example: score
 *         description: Champ à utiliser pour l'agrégation (non requis pour count)
 *     responses:
 *       200:
 *         description: Résultat de l'agrégation dynamique
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 additionalProperties: true
 */

  analytics.get('/search', async (req, res) => {
    const { groupBy, metric, field } = req.query;
  
    const allowedMetrics = {
      avg: '$avg',
      sum: '$sum',
      count: '$count'
    };
  
    const mongoMetric = allowedMetrics[metric];
  
    if (!mongoMetric || !groupBy || (!field && metric !== 'count')) {
      return res.status(400).json({ error: 'Paramètres invalides' });
    }
  
    try {
      const groupStage = {
        _id: `$${groupBy}`
      };
  
      if (metric === 'count') {
        groupStage.count = { $sum: 1 };
      } else {
        groupStage.result = { [mongoMetric]: `$${field}` };
      }
  
      const result = await Potion.aggregate([{ $group: groupStage }]);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

 module.exports = analytics;