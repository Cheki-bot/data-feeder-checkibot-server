export interface ICalendarSignature {
  full_name: string;
  position: string;
}

export interface ICalendarEvent {
  _id?: string;
  scenery: string;
  no: number;
  activity: string;
  days: number;
  from_date: Date;
  to_date: Date;
  duration: number;
  reference: string;
  place: string;
  calendar_id: string;
}

export interface IElectoralCalendar {
  _id?: string;
  pdf_url: string;
  title: string;
  resolution: string;
  date: Date;
  introduction?: string;
  signatures: ICalendarSignature[];
  events: ICalendarEvent[];
  election_id: string;
}
