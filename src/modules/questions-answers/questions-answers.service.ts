import { IQuestionsAndAnswers } from '@/types';
import { Db, Filter, InsertOneResult, ObjectId } from 'mongodb';

export async function getQuestionsAnswersService(db: Db): Promise<IQuestionsAndAnswers[]> {
  const questionsAnswers = await db
    .collection<IQuestionsAndAnswers>('questions_and_answers')
    .find()
    .toArray();

  const questionAnswersMap = new Map<string, IQuestionsAndAnswers>();

  questionsAnswers.forEach(qa => {
    questionAnswersMap.set(qa._id, qa);
  });

  console.log(questionAnswersMap);
  return Array.from(questionAnswersMap.values());
}

export async function createQuestionsAnswersService(
  db: Db,
  question: string,
  answer: string,
): Promise<InsertOneResult<IQuestionsAndAnswers>> {
  const newQuestionsAnswers = {
    question: question,
    answer: answer,
  };
  const result = await db
    .collection<IQuestionsAndAnswers>('questions_and_answers')
    .insertOne(newQuestionsAnswers);
  console.log(result);
  return result;
}

export async function updateQuestionsAnswersService(
  db: Db,
  questionId: string,
  question: string,
  answer: string,
): Promise<void> {
  const filter: Filter<IQuestionsAndAnswers> = {
    _id: new ObjectId(questionId),
  } as unknown as Filter<IQuestionsAndAnswers>;
  await db.collection<IQuestionsAndAnswers>('questions_and_answers').updateMany(filter, {
    $set: {
      question: question,
      answer: answer,
    },
  });
}

export async function deleteQuestionsAnswersService(
  db: Db,
  questions_answersId: string[],
): Promise<void> {
  const collection = db.collection<IQuestionsAndAnswers>('questions_and_answers');

  const objectIds = questions_answersId.map(id => new ObjectId(id));
  const filter = { _id: { $in: objectIds } } as unknown as Filter<IQuestionsAndAnswers>;

  await collection.deleteMany(filter);
}
