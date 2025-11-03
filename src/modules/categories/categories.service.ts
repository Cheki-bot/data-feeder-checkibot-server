import { Db } from 'mongodb';

interface Category {
  name: string;
  description?: string;
}

export async function getCategoriesService(db: Db): Promise<Category[]> {
  const categories = await db.collection<Category>('categories').find().toArray();
  return categories.map(category => ({
    name: category.name,
    description: category.description,
  }));
}
