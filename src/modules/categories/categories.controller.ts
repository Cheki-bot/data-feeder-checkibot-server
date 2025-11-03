import { Request, Response, NextFunction } from 'express';
import { getCategoriesService } from './categories.service';
import { Db } from 'mongodb';

export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const db = (req.app.locals as { db: Db }).db;
    const categories = await getCategoriesService(db);
    res.json(categories);
  } catch (err) {
    next(err);
  }
}
