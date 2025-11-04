import { ObjectId } from 'mongodb';

export interface CalendarEventDocument {
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
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CalendarEventResponse {
  _id: ObjectId;
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
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCalendarEventData {
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

export function createCalendarEventDocument(
  data: CreateCalendarEventData,
  userEmail: string,
): Omit<CalendarEventDocument, '_id'> {
  const now = new Date();

  return {
    scenery: data.scenery,
    no: data.no,
    activity: data.activity,
    days: data.days,
    from_date: data.from_date,
    to_date: data.to_date,
    duration: data.duration,
    reference: data.reference,
    place: data.place,
    calendar_id: data.calendar_id,
    created_by: userEmail,
    created_at: now,
    updated_at: now,
  };
}

export function createCalendarEventResponse(event: CalendarEventDocument): CalendarEventResponse {
  if (event._id === undefined) {
    throw new Error('Cannot create response for calendar event without _id');
  }

  return {
    _id: event._id,
    scenery: event.scenery,
    no: event.no,
    activity: event.activity,
    days: event.days,
    from_date: event.from_date,
    to_date: event.to_date,
    duration: event.duration,
    reference: event.reference,
    place: event.place,
    calendar_id: event.calendar_id,
    created_by: event.created_by,
    created_at: event.created_at,
    updated_at: event.updated_at,
  };
}
