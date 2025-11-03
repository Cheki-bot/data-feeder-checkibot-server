import { Db } from 'mongodb';

interface RawPoliticalParty {
  _id: string;
  party?: {
    name: string;
    sigla: string;
    founded?: string;
  };
}

interface PoliticalParty {
  id: string;
  name: string;
  abbreviation: string;
  founded?: Date;
}

export async function getPoliticalPartiesService(db: Db): Promise<PoliticalParty[]> {
  const candidacies = await db
    .collection<RawPoliticalParty>('candidacies')
    .find({ party: { $exists: true } })
    .toArray();

  const partyMap = new Map<string, PoliticalParty>();

  candidacies.forEach(doc => {
    if (doc.party) {
      const id = doc._id.toString();
      const name = doc.party.name;
      const abbreviation = doc.party.sigla;
      let founded: Date | undefined;
      const foundedStr = doc.party.founded;

      if (typeof foundedStr === 'string' && foundedStr.trim() !== '') {
        const parsed = new Date(foundedStr);
        if (!isNaN(parsed.getTime())) {
          founded = parsed;
        }
      }

      partyMap.set(name, { id, name, abbreviation, founded });
    }
  });

  return Array.from(partyMap.values());
}
