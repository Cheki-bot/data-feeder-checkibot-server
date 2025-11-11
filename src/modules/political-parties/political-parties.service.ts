import { CandidacyStatus, ICandidacy, IPoliticalParty, IPolitician } from '@/types';
import { Db, ObjectId } from 'mongodb';

export async function getPoliticalPartiesService(db: Db): Promise<IPoliticalParty[]> {
  const candidacies = await db
    .collection<ICandidacy>('candidacies')
    .find({ party: { $exists: true } })
    .toArray();

  const partyMap = new Map<string, IPoliticalParty>();

  candidacies.forEach(doc => {
    const id = doc._id.toString();
    const name = doc.party.name;
    const sigla = doc.party.sigla;
    const description = doc.party.description;

    partyMap.set(name, { id, name, sigla, description });
  });

  return Array.from(partyMap.values());
}

export async function createPoliticalPartyService(
  db: Db,
  party: IPoliticalParty,
  candidates: IPolitician[],
  status: CandidacyStatus,
  government_plan: string,
  election_id: string,
  founded?: Date,
): Promise<ICandidacy> {
  const Candidacie: ICandidacy = {
    candidates: candidates,
    status: status,
    government_plan: government_plan,
    election_id: election_id,
    party: {
      name: party.name,
      sigla: party.sigla,
      description: party.description,
    },
    founded: founded ? founded.toISOString() : undefined,
  };

  await db.collection<ICandidacy>('candidacies').insertOne(Candidacie);

  return {
    status: Candidacie.status,
    government_plan: Candidacie.government_plan,
    election_id: Candidacie.election_id,
    candidates: Candidacie.candidates,
    party: {
      name: party.name,
      sigla: party.sigla,
      description: party.description,
    },
    founded: Candidacie.founded,
  };
}

export async function updateCandidacyService(
  db: Db,
  candidacyId: string,
  body: Partial<ICandidacy>,
): Promise<ICandidacy | null> {
  if (!ObjectId.isValid(candidacyId)) {
    throw new Error('Invalid candidacy ID');
  }

  const updates = Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined),
  ) as Partial<ICandidacy>;

  const result = await db
    .collection<ICandidacy>('candidacies')
    .findOneAndUpdate(
      { _id: new ObjectId(candidacyId) },
      { $set: updates },
      { returnDocument: 'after' },
    );

  return result;
}

export async function deleteCandidacyService(db: Db, candidacyId: string): Promise<boolean> {
  if (!ObjectId.isValid(candidacyId)) {
    throw new Error('Invalid candidacy ID');
  }

  const result = await db
    .collection<ICandidacy>('candidacies')
    .deleteOne({ _id: new ObjectId(candidacyId) });

  return result.deletedCount === 1;
}

export async function getCandidacyByIdService(
  db: Db,
  candidacyId: string,
): Promise<ICandidacy | null> {
  try {
    return await db
      .collection<ICandidacy>('candidacies')
      .findOne({ _id: new ObjectId(candidacyId) });
  } catch (error) {
    console.error('Error fetching candidacy by ID:', error);
    return null;
  }
}
