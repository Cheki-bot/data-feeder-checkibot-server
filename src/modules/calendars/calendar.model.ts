import { ObjectId } from 'mongodb';

/**
 * Electoral Calendar Model
 * Represents an electoral calendar with events and signatures
 */

export interface CalendarSignature {
  full_name: string;
  position: string;
}

export interface CalendarEvent {
  _id?: ObjectId;
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

export interface ElectoralCalendarDocument {
  _id?: ObjectId;
  pdf_url: string;
  title: string;
  resolution: string;
  date: Date;
  introduction?: string;
  signatures: CalendarSignature[];
  events: CalendarEvent[];
  election_id: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface ElectoralCalendarResponse {
  _id: ObjectId;
  pdf_url: string;
  title: string;
  resolution: string;
  date: Date;
  introduction?: string;
  signatures: CalendarSignature[];
  events: CalendarEvent[];
  election_id: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateElectoralCalendarData {
  pdf_url: string;
  title: string;
  resolution: string;
  date: Date;
  introduction?: string;
  signatures: CalendarSignature[];
  events: CalendarEvent[];
  election_id: string;
}

/**
 * Create a new electoral calendar document
 */
export function createElectoralCalendarDocument(
  calendarData: CreateElectoralCalendarData,
  userEmail: string,
): Omit<ElectoralCalendarDocument, '_id'> {
  const now = new Date();

  return {
    pdf_url: calendarData.pdf_url,
    title: calendarData.title,
    resolution: calendarData.resolution,
    date: calendarData.date,
    introduction: calendarData.introduction,
    signatures: calendarData.signatures,
    events: calendarData.events,
    election_id: calendarData.election_id,
    created_by: userEmail,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Create electoral calendar response (safe to send to client)
 */
export function createElectoralCalendarResponse(
  calendar: ElectoralCalendarDocument,
): ElectoralCalendarResponse {
  if (calendar._id === undefined) {
    throw new Error('Cannot create response for electoral calendar without _id');
  }

  return {
    _id: calendar._id,
    pdf_url: calendar.pdf_url,
    title: calendar.title,
    resolution: calendar.resolution,
    date: calendar.date,
    introduction: calendar.introduction,
    signatures: calendar.signatures,
    events: calendar.events,
    election_id: calendar.election_id,
    created_by: calendar.created_by,
    created_at: calendar.created_at,
    updated_at: calendar.updated_at,
  };
}
