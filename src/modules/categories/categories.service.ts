import { Db } from 'mongodb';

interface Category {
  name: string;
  description?: string;
  destination?: string;
}

export async function getCategoriesService(db: Db): Promise<Category[]> {
  const categories = await db.collection<Category>('categories').find().toArray();
  return categories.map(category => ({
    destination: category.destination,
    name: category.name,
    description: category.description,
  }));
}
