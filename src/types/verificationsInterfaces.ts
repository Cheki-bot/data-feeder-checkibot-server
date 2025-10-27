export interface INewsTag {
  name: string;
  url: string;
}

export interface INewsVerification {
  _id?: string;
  title: string;
  classified_as: string;
  section_url: string;
  summary: string;
  body: string;
  url: string;
  publication_date: Date;
  tags: INewsTag[];
}