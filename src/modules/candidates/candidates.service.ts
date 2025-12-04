import { ICandidacy, IPolitician } from '@/types';
import { type Db, ObjectId } from 'mongodb';
import { ICandidate } from './candidates.model';

export const createCandidateService = async (db: Db, candidateData: ICandidate): Promise<void> => {
  const { candidacyId, ...candidateInfo } = candidateData;

  if (typeof candidacyId !== 'string' || candidacyId.trim() === '') {
    throw new Error('candidateData.candidacyId (candidacy ID) es requerido');
  }

  const candidaciesCollection = db.collection<ICandidacy>('candidacies');

  const candidacy = await candidaciesCollection.findOne({
    _id: new ObjectId(candidacyId),
  });

  if (!candidacy) {
    throw new Error('Candidacy no encontrada');
  }

  await candidaciesCollection.updateOne(
    { _id: new ObjectId(candidacyId) },
    { $push: { candidates: candidateInfo } },
  );
};

export const getCandidatesByCandidacyService = async (
  db: Db,
  candidacyId: string,
): Promise<IPolitician[]> => {
  const candidaciesCollection = db.collection<ICandidacy>('candidacies');

  const candidacy = await candidaciesCollection.findOne({
    _id: new ObjectId(candidacyId),
  });

  if (!candidacy) {
    throw new Error('Candidacy no encontrada');
  }

  return candidacy.candidates;
};

export const deleteCandidateService = async (
  db: Db,
  candidacyId: string,
  candidateName: string,
): Promise<void> => {
  const candidaciesCollection = db.collection<ICandidacy>('candidacies');

  const candidacy = await candidaciesCollection.findOne({ _id: new ObjectId(candidacyId) });
  if (!candidacy) {
    throw new Error('Candidacy no encontrada');
  }

  await candidaciesCollection.updateOne(
    { _id: new ObjectId(candidacyId) },
    { $pull: { candidates: { full_name: candidateName } } },
  );
};

export const updateCandidateService = async (
  db: Db,
  candidacyId: string,
  candidateName: string,
  updateData: Partial<IPolitician>,
): Promise<void> => {
  const candidaciesCollection = db.collection<ICandidacy>('candidacies');

  const candidacy = await candidaciesCollection.findOne({ _id: new ObjectId(candidacyId) });
  if (!candidacy) {
    throw new Error('Candidacy no encontrada');
  }

  await candidaciesCollection.updateOne(
    { _id: new ObjectId(candidacyId), 'candidates.full_name': candidateName },
    {
      $set: Object.fromEntries(
        Object.entries(updateData).map(([key, value]) => [`candidates.$.${key}`, value]),
      ),
    },
  );
};
