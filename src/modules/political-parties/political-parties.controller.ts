import { Request, Response } from 'express';
import { getPoliticalPartiesService } from './political-parties.service';
import { Db } from 'mongodb';

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
