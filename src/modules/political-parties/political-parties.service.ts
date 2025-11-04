import { CandidacyStatus, ICandidacy, IPoliticalParty, IPolitician } from '@/types';
import { Db } from 'mongodb';

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
