export enum CandidacyStatus {
  ACTIVE = 'habilitado',
  INACTIVE = 'inhabilitado',
  WITHDRAWN = 'se retiró',
}

export enum ElectionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  UPCOMING = 'upcoming',
}

export enum ElectionRound {
  FIRST_ROUND = 'primera vuelta',
  SECOND_ROUND = 'segunda vuelta',
}

export interface IPolitician {
  full_name: string;
  position: string;
}

export interface IPoliticalParty {
  name: string;
  sigla: string;
  description?: string;
}

export interface ICandidacy {
  _id?: string;
  party: IPoliticalParty;
  candidates: IPolitician[];
  status: CandidacyStatus;
  government_plan: string;
  election_id: string;
}

export interface IElection {
  _id?: string;
  name: string;
  description: string;
  election_date: Date;
  candidacies: ICandidacy[];
  status: ElectionStatus;
  active_round: ElectionRound;
  winner?: ICandidacy;
  result?: string;
}
