import { Request, Response } from 'express';
import {
  createPoliticalPartyService,
  getPoliticalPartiesService,
} from './political-parties.service';
import { Db } from 'mongodb';
import { ICandidacy } from '@/types';

export async function getPoliticalParties(req: Request, res: Response): Promise<Response> {
  try {
    const db = (req.app.locals as { db: Db }).db;
    const politicalParties = await getPoliticalPartiesService(db);
    return res.status(200).send({
      message: 'Political parties fetched successfully',
      ok: true,
      status: 200,
      data: politicalParties,
    });
  } catch (error) {
    console.error('Error fetching political parties:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error', ok: false, status: 500, data: null });
  }
}

export async function createPoliticalPartyController(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const db = (req.app.locals as { db: Db }).db;
    const { party, candidates, status, government_plan, election_id, founded } =
      req.body as ICandidacy;

    if (
      party == null ||
      candidates == null ||
      status == null ||
      government_plan == null ||
      election_id == null ||
      (Array.isArray(candidates) && candidates.length === 0)
    ) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: 'Party, candidates, status, government_plan and election_id are required',
        data: null,
      });
    }

    const existingParty = await db.collection('candidacies').findOne({
      'party.name': { $regex: `^${party.name}$`, $options: 'i' },
    });
    if (existingParty) {
      return res.status(409).json({
        ok: false,
        status: 409,
        message: `The political party "${party}" already exists`,
        data: existingParty,
      });
    }

    const foundedDate =
      founded !== null && founded !== undefined && founded !== ''
        ? new Date(founded as string | number | Date)
        : undefined;

    const createdParty = await createPoliticalPartyService(
      db,
      party,
      candidates,
      status,
      government_plan,
      election_id,
      foundedDate,
    );

    return res.status(201).json({
      ok: true,
      status: 201,
      message: 'Political party created successfully',
      data: createdParty,
    });
  } catch (error) {
    console.error('Error creating political party:', error);
    return res.status(500).json({
      ok: false,
      status: 500,
      message: 'Internal server error',
      data: null,
    });
  }
}
