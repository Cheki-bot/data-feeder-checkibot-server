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

//generate docs swagger for this route
/**
 * @openapi
 * /political-parties:
 *   post:
 *     summary: Crear un nuevo partido político
 *     tags:
 *       - Partidos Políticos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               party:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Partido Nuevo
 *                   sigla:
 *                     type: string
 *                     example: PN
 *                   description:
 *                     type: string
 *                     example: Descripción del partido nuevo
 *               candidates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     full_name:
 *                       type: string
 *                       example: Juan Pérez
 *                     position:
 *                       type: string
 *                       example: Presidente
 *               status:
 *                 type: string
 *                 example: active
 *               government_plan:
 *                 type: string
 *                 example: Plan de gobierno del partido nuevo
 *               election_id:
 *                 type: string
 *                 example: 60d5f9f5f1d2c4b5d6e8f9a1
 *               founded:
 *                 type: string
 *                 format: date-time
 *                 example: 2020-01-01T00:00:00.000Z
 *     responses:
 *       201:
 *         description: Partido político creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Political party created successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 60d5f9f5f1d2c4b5d6e8f9a0
 *                     name:
 *                       type: string
 *                       example: Partido Nuevo
 *                     abbreviation:
 *                       type: string
 *                       example: PN
 *                     founded:
 *                       type: string
 *                       format: date-time
 *                       example: 2020-01-01T00:00:00.000Z
 */

partiesRouter.post('/', PoliticalPartiesController.createPoliticalPartyController);
// generate swagger doc for put route to update candidacy by id
/**
 * @openapi
 * /political-parties/{candidacyId}:
 *   put:
 *     summary: Actualizar una candidatura existente
 *     tags:
 *       - Partidos Políticos
 *     parameters:
 *       - in: path
 *         name: candidacyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la candidatura a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               party:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Partido Actualizado
 *                   sigla:
 *                     type: string
 *                     example: PA
 *                   description:
 *                     type: string
 *                     example: Descripción del partido actualizado
 *               status:
 *                 type: string
 *                 example: active
 *               government_plan:
 *                 type: string
 *                 example: Plan de gobierno del partido actualizado
 *               founded:
 *                 type: string
 *                 format: date-time
 *                 example: 2020-01-01T00:00:00.000Z
 */

partiesRouter.put('/:candidacyId', PoliticalPartiesController.updateCandidacyController);
partiesRouter.delete('/:candidacyId', PoliticalPartiesController.deleteCandidacyController);

export default partiesRouter;
