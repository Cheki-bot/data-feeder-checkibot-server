import { Request, Response } from 'express';
import { type Db } from 'mongodb';
import {
  createCandidateService,
  deleteCandidateService,
  getCandidatesByCandidacyService,
  updateCandidateService,
} from './candidates.service';
import { IPolitician } from '@/types';
import { ICandidate } from './candidates.model';

export const createCandidateController = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = (req.app.locals as { db: Db }).db;
    const candidateData = req.body as ICandidate;
    await createCandidateService(db, candidateData);
    res.status(201).json({
      message: 'Candidate created successfully',
      ok: true,
      status: 201,
    });
  } catch (error) {
    res.status(500).json({
      message: `Internal server error: ${(error as Error).message}`,
      ok: false,
      status: 500,
    });
  }
};

export const getCandidatesByCandidacyController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const db = (req.app.locals as { db: Db }).db;
    const { candidacyId } = req.params;
    const candidates = await getCandidatesByCandidacyService(db, candidacyId);
    res.status(200).json({
      message: 'Candidates retrieved successfully',
      ok: true,
      status: 200,
      data: candidates,
    });
  } catch (error) {
    console.error('Error getting categories', error);

    res.status(500).json({
      message: `Internal server error: ${(error as Error).message}`,
      ok: false,
      status: 500,
    });
  }
};

export const deleteCandidateController = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = (req.app.locals as { db: Db }).db;
    const { candidacyId, candidateName } = req.body as {
      candidacyId: string;
      candidateName: string;
    };
    await deleteCandidateService(db, candidacyId, candidateName);
    res.status(200).json({
      message: 'Candidate deleted successfully',
      ok: true,
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      message: `Internal server error: ${(error as Error).message}`,
      ok: false,
      status: 500,
    });
  }
};

export const updateCandidateController = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = (req.app.locals as { db: Db }).db;
    const { candidacyId, candidateName } = req.params;
    const updateData = req.body as Partial<IPolitician>;
    await updateCandidateService(db, candidacyId, candidateName, updateData);
    res.status(200).json({
      message: 'Candidate updated successfully',
      ok: true,
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      message: `Internal server error: ${(error as Error).message}`,
      ok: false,
      status: 500,
    });
  }
};
