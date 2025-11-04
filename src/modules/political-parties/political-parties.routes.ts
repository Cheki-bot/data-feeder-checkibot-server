import { Router } from 'express';
import * as PoliticalPartiesController from './political-parties.controller';

const partiesRouter = Router();

/**
 * @openapi
 * /political-parties:
 *   get:
 *     summary: Obtener todos los partidos políticos
 *     tags:
 *       - Partidos Políticos
 *     responses:
 *       200:
 *         description: Lista de partidos políticos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Political parties fetched successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 60d5f9f5f1d2c4b5d6e8f9a0
 *                       name:
 *                         type: string
 *                         example: Partido Ejemplo
 *                       abbreviation:
 *                         type: string
 *                         example: PE
 *                       founded:
 *                         type: string
 *                         format: date-time
 *                         example: 2000-01-01T00:00:00.000Z
 */

partiesRouter.get('/', PoliticalPartiesController.getPoliticalParties);
partiesRouter.post('/', PoliticalPartiesController.createPoliticalPartyController);

export default partiesRouter;
