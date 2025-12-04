import { Request, Response } from 'express';

import { Db } from 'mongodb';
import {
  createQuestionsAnswersService,
  createMultipleQuestionsAnswersService,
  deleteQuestionsAnswersService,
  getQuestionsAnswersService,
  updateQuestionsAnswersService,
} from './questions-answers.service';
import { IQuestionsAndAnswers } from '@/types';

export const getQuestionsAnswersController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const db = (req.app.locals as { db: Db }).db;

    const questionsAnswers = await getQuestionsAnswersService(db);

    return res.status(200).json({
      ok: true,
      status: 200,
      message: 'Questions and Answers fetched successfully',
      data: questionsAnswers,
    });
  } catch (error) {
    console.error('Error fetching Questions and Answers:', error);
    return res.status(500).json({
      ok: false,
      status: 500,
      message: 'Internal server error',
      data: null,
    });
  }
};

export const createQuestionsAnswersController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const db = (req.app.locals as { db: Db }).db;

    const { question, answer } = req.body as IQuestionsAndAnswers;

    if (question === null || answer === null) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: 'Invalid input: question and answer are required and must be strings',
        data: null,
      });
    }

    const result = await createQuestionsAnswersService(db, question, answer);

    return res.status(201).json({
      ok: true,
      status: 201,
      message: 'Questions and Answers created successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error creating Questions and Answers:', error);
    return res.status(500).json({
      ok: false,
      status: 500,
      message: 'Internal server error',
      data: null,
    });
  }
};

export const updateQuestionsAnswersController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const db = (req.app.locals as { db: Db }).db;
    const { questionId } = req.params;
    const { question, answer } = req.body as IQuestionsAndAnswers;

    if (question === null || answer === null) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: 'Invalid input: question and answer are required and must be strings',
        data: null,
      });
    }

    await updateQuestionsAnswersService(db, questionId, question, answer);

    return res.status(200).json({
      ok: true,
      status: 200,
      message: 'Questions and Answers updated successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error updating Questions and Answers:', error);
    return res.status(500).json({
      ok: false,
      status: 500,
      message: 'Internal server error',
      data: null,
    });
  }
};

export const deleteQuestionsAnswersController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const db = (req.app.locals as { db: Db }).db;

    const body = req.body as { questions_answersId?: unknown };
    const rawQuestionsAnswersId = body.questions_answersId;

    if (
      rawQuestionsAnswersId === null ||
      !Array.isArray(rawQuestionsAnswersId) ||
      rawQuestionsAnswersId.length === 0
    ) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: 'questions_answersId is required and should be a non-empty array',
        data: null,
      });
    }

    const questions_answersId = rawQuestionsAnswersId
      .filter((id): id is string | number => typeof id === 'string' || typeof id === 'number')
      .map(String);

    if (questions_answersId.length === 0) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: 'questions_answersId must contain at least one valid id (string or number)',
        data: null,
      });
    }

    await deleteQuestionsAnswersService(db, questions_answersId);

    return res.status(200).json({
      ok: true,
      status: 200,
      message: 'Questions and Answers deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting Questions and Answers:', error);
    return res.status(500).json({
      ok: false,
      status: 500,
      message: 'Internal server error',
      data: null,
    });
  }
};

export const createMultipleQuestionsAnswersController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const db = (req.app.locals as { db: Db }).db;

    const body = req.body as {
      questionsAnswersData?: { question: string; answer: string }[];
    };

    const questionsAnswersData = body.questionsAnswersData;

    if (!Array.isArray(questionsAnswersData) || questionsAnswersData.length === 0) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: 'questionsAnswersData must be a non-empty array',
        data: null,
      });
    }

    const creationResults = await createMultipleQuestionsAnswersService(db, questionsAnswersData);

    return res.status(201).json({
      ok: true,
      status: 201,
      message: 'Multiple Questions and Answers created successfully',
      data: creationResults,
    });
  } catch (error) {
    console.error('Error creating multiple Questions and Answers:', error);
    return res.status(500).json({
      ok: false,
      status: 500,
      message: 'Internal server error',
      data: null,
    });
  }
};
