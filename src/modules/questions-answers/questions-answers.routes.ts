import { Router } from 'express';
import * as QuestionsAnswersController from './questions-answers.controller';

const questionsAnswersRouter = Router();

questionsAnswersRouter.get('/', QuestionsAnswersController.getQuestionsAnswersController);

questionsAnswersRouter.post('/', QuestionsAnswersController.createQuestionsAnswersController);

questionsAnswersRouter.delete('/', QuestionsAnswersController.deleteQuestionsAnswersController);

questionsAnswersRouter.put(
  '/:questionId',
  QuestionsAnswersController.updateQuestionsAnswersController,
);

export default questionsAnswersRouter;
