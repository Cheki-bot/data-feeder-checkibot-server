import { Router } from 'express';
import * as QuestionsAnswersController from './questions-answers.controller';

const questionsAnswersRouter = Router();

/**
 * @openapi
 * /questions-answers:
 *   get:
 *     summary: Obtener todas las preguntas y respuestas
 *     tags:
 *       - Preguntas y Respuestas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de preguntas y respuestas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Questions and Answers fetched successfully
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
 *                       question:
 *                         type: string
 *                         example: ¿Cuál es la capital de Francia?
 *                       answer:
 *                         type: string
 *                         example: La capital de Francia es París.
 */
questionsAnswersRouter.get('/', QuestionsAnswersController.getQuestionsAnswersController);

/**
 * @openapi
 * /questions-answers:
 *   post:
 *     summary: Crear una nueva pregunta y respuesta
 *     tags:
 *       - Preguntas y Respuestas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 example: ¿Cuál es la capital de Francia?
 *               answer:
 *                 type: string
 *                 example: La capital de Francia es París.
 *     responses:
 *       201:
 *         description: Pregunta y respuesta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Questions and Answers created successfully
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
 *                     question:
 *                       type: string
 *                       example: ¿Cuál es la capital de Francia?
 *                     answer:
 *                       type: string
 *                       example: La capital de Francia es París.
 */
questionsAnswersRouter.post('/', QuestionsAnswersController.createQuestionsAnswersController);

/**
 * @openapi
 * /questions-answers:
 *   delete:
 *     summary: Eliminar todas las preguntas y respuestas
 *     tags:
 *       - Preguntas y Respuestas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preguntas y respuestas eliminadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Questions and Answers deleted successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: null
 *                   example: null
 */
questionsAnswersRouter.delete('/', QuestionsAnswersController.deleteQuestionsAnswersController);

/**
 * @openapi
 * /questions-answers/{questionId}:
 *   put:
 *     summary: Actualizar una pregunta y respuesta existente
 *     tags:
 *       - Preguntas y Respuestas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la pregunta y respuesta a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 example: ¿Cuál es la capital de Francia?
 *               answer:
 *                 type: string
 *                 example: La capital de Francia es París.
 *     responses:
 *       200:
 *         description: Pregunta y respuesta actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Questions and Answers updated successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: null
 *                   example: null
 */
questionsAnswersRouter.put(
  '/:questionId',
  QuestionsAnswersController.updateQuestionsAnswersController,
);

export default questionsAnswersRouter;
