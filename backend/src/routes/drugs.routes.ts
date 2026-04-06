// src/routes/drugs.routes.ts
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { searchDrugs, getDrugDetails } from '../controllers/drugs.controller';

const router = Router();

/**
 * @swagger
 * /drugs/search:
 *   get:
 *     summary: Buscar medicamentos en la API CIMA
 *     tags: [Drugs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *       400:
 *         description: Término demasiado corto
 */
router.get('/search', authenticate, searchDrugs);

/**
 * @swagger
 * /drugs/{nregistro}:
 *   get:
 *     summary: Obtener detalles de un medicamento por registro CIMA
 *     tags: [Drugs]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: nregistro
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detalles del medicamento
 *       500:
 *         description: Error al consultar CIMA
 */
router.get('/:nregistro', authenticate, getDrugDetails);

export default router;
