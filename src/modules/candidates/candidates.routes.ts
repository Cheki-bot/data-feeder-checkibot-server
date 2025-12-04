import { Router } from 'express';
import * as CandidatesController from './candidates.controller';

const candidatesRouter = Router();

/**
 * @openapi
 * /candidates:
 *   post:
 *     summary: Crear un nuevo candidato
 *     tags:
 *       - Candidatos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Juan Pérez
 *               candidacyId:
 *                 type: string
 *                 example: 60d5f9f5f1d2c4b5d6e8f9a0
 *               position:
 *                 type: string
 *                 example: diputado
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Candidato creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Candidate created successfully
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
 *                       example: Juan Pérez
 *                     candidacyId:
 *                       type: string
 *                       example: 60d5f9f5f1d2c4b5d6e8f9a0
 *                     party:
 *                       type: string
 *                       example: Partido Ejemplo
 */

candidatesRouter.post('/', CandidatesController.createCandidateController);

/**
 * @openapi
 * /candidates/{candidacyId}:
 *   get:
 *     summary: Obtener candidatos por ID de candidatura
 *     tags:
 *       - Candidatos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidacyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la candidatura
 *     responses:
 *       200:
 *         description: Lista de candidatos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Candidates retrieved successfully
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
 *                         example: Juan Pérez
 *                       candidacyId:
 *                         type: string
 *                         example: 60d5f9f5f1d2c4b5d6e8f9a0
 *                       party:
 *                         type: string
 *                         example: Partido Ejemplo
 */
candidatesRouter.get('/:candidacyId', CandidatesController.getCandidatesByCandidacyController);

/**
 * @openapi
 * /candidates/{candidateId}:
 *   delete:
 *     summary: Eliminar un candidato por ID
 *     tags:
 *       - Candidatos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               candidateName:
 *                 type: string
 *                 example: Juan Pérez
 *               candidacyId:
 *                 type: string
 *                 example: 60d5f9f5f1d2c4b5d6e8f9a0
 *     responses:
 *       200:
 *         description: Candidato eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Candidate deleted successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 200
 */
candidatesRouter.delete('/:candidateId', CandidatesController.deleteCandidateController);

/**
 * @openapi
 * /candidates/{candidateId}:
 *   put:
 *     summary: Actualizar un candidato por ID
 *     tags:
 *       - Candidatos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del candidato a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez Actualizado
 *               party:
 *                 type: string
 *                 example: Partido Ejemplo Actualizado
 *     responses:
 *       200:
 *         description: Candidato actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Candidate updated successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 200
 */
candidatesRouter.put('/:candidateId', CandidatesController.updateCandidateController);

export default candidatesRouter;
