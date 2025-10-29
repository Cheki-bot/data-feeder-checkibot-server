import { Router } from 'express';
import {
  createNewsValidation,
  updateNewsValidation,
  newsIdParamValidation,
} from '../../validators/news.js';
import { authenticateToken, getCurrentUser, requireAdmin } from '../../middleware/auth.js';
import * as NewsController from './news.controller.js';

const router = Router();

router.use(authenticateToken, getCurrentUser);

router.post('/', createNewsValidation, NewsController.createNews);

router.get('/', NewsController.getAllNews);

router.get('/:id', newsIdParamValidation, NewsController.getNewsById);

router.patch('/:id', newsIdParamValidation, updateNewsValidation, NewsController.updateNews);

router.delete('/:id', newsIdParamValidation, requireAdmin, NewsController.deleteNews);

export default router;
