import { Router } from 'express';
import * as CategoriesController from './categories.controller';

const router = Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags:
 *       - Categorías
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Candidaturas
 *                   description:
 *                     type: string
 *                     example: Categoría relacionada con candidaturas políticas
 */
router.get('/', CategoriesController.getCategories);

export default router;
