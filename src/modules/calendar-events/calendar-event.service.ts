import { Db, ObjectId } from 'mongodb';
import {
  CalendarEventDocument,
  CalendarEventResponse,
  CreateCalendarEventData,
  createCalendarEventDocument,
  createCalendarEventResponse,
} from './calendar-event.model';

export interface CalendarEventFilters {
  created_by?: string;
  calendar_id?: string;
}

const COLLECTION = 'calendar_events';

export async function createCalendarEvent(
  db: Db,
  data: CreateCalendarEventData,
  userEmail: string,
): Promise<CalendarEventResponse> {
  const doc = createCalendarEventDocument(data, userEmail);
  const result = await db.collection<CalendarEventDocument>(COLLECTION).insertOne(doc);
  const created = await db
    .collection<CalendarEventDocument>(COLLECTION)
    .findOne({ _id: result.insertedId });

  if (created === null) {
    throw new Error('Failed to retrieve newly created calendar event');
  }

  return createCalendarEventResponse(created);
}

export async function getAllCalendarEvents(
  db: Db,
  filters: CalendarEventFilters = {},
): Promise<CalendarEventResponse[]> {
  const query: Partial<CalendarEventDocument> = {};
  if (filters.created_by !== undefined) query.created_by = filters.created_by;
  if (filters.calendar_id !== undefined) query.calendar_id = filters.calendar_id;

  const events = await db
    .collection<CalendarEventDocument>(COLLECTION)
    .find(query)
    .sort({ from_date: 1, no: 1 })
    .toArray();

  return events.map(createCalendarEventResponse);
}

export async function getCalendarEventById(
  db: Db,
  id: string,
): Promise<CalendarEventResponse | null> {
  if (!ObjectId.isValid(id)) {
    throw new Error('INVALID_CALENDAR_EVENT_ID');
  }

  const event = await db
    .collection<CalendarEventDocument>(COLLECTION)
    .findOne({ _id: new ObjectId(id) });

  if (event === null) return null;

  return createCalendarEventResponse(event);
}

export async function updateCalendarEvent(
  db: Db,
  id: string,
  updateData: Partial<CreateCalendarEventData>,
): Promise<CalendarEventResponse | null> {
  if (!ObjectId.isValid(id)) {
    throw new Error('INVALID_CALENDAR_EVENT_ID');
  }

  const sanitizedData: Partial<CreateCalendarEventData> = {};
  if (updateData.scenery !== undefined) sanitizedData.scenery = updateData.scenery;
  if (updateData.no !== undefined) sanitizedData.no = updateData.no;
  if (updateData.activity !== undefined) sanitizedData.activity = updateData.activity;
  if (updateData.days !== undefined) sanitizedData.days = updateData.days;
  if (updateData.from_date !== undefined) sanitizedData.from_date = updateData.from_date;
  if (updateData.to_date !== undefined) sanitizedData.to_date = updateData.to_date;
  if (updateData.duration !== undefined) sanitizedData.duration = updateData.duration;
  if (updateData.reference !== undefined) sanitizedData.reference = updateData.reference;
  if (updateData.place !== undefined) sanitizedData.place = updateData.place;
  if (updateData.calendar_id !== undefined) sanitizedData.calendar_id = updateData.calendar_id;

  const updates: Partial<CalendarEventDocument> = {
    ...(sanitizedData as Partial<CalendarEventDocument>),
    updated_at: new Date(),
  };

  const result = await db
    .collection<CalendarEventDocument>(COLLECTION)
    .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updates }, { returnDocument: 'after' });

  if (result === null) return null;

  return createCalendarEventResponse(result);
}

export async function deleteCalendarEvent(db: Db, id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) {
    throw new Error('INVALID_CALENDAR_EVENT_ID');
  }

  const result = await db
    .collection<CalendarEventDocument>(COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });

  return result.deletedCount > 0;
}
