import { Request, Response } from 'express';
import { Db } from 'mongodb';
import { getCategoriesService } from './categories.service';

export async function getCategories(req: Request, res: Response): Promise<Response> {
  try {
    const db = (req.app.locals as { db: Db }).db;
    const categories = await getCategoriesService(db);

    return res.status(200).send({
      message: 'Categorías obtenidas correctamente',
      ok: true,
      status: 200,
      data: categories,
    });
  } catch (error) {
    console.error('Error getting categories', error);

    return res.status(500).send({
      message: 'Ocurrió un error en el servidor',
      ok: false,
      status: 500,
      data: null,
    });
  }
}
