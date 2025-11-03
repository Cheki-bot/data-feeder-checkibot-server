import { Db, ObjectId } from 'mongodb';
import {
  createElectoralCalendarDocument,
  createElectoralCalendarResponse,
  CreateElectoralCalendarData,
  ElectoralCalendarDocument,
  ElectoralCalendarResponse,
} from './calendar.model';

export interface ElectoralCalendarFilters {
  election_id?: string;
  created_by?: string;
}

/**
 * Create a new electoral calendar
 */
export async function createElectoralCalendar(
  db: Db,
  calendarData: CreateElectoralCalendarData,
  userEmail: string,
): Promise<ElectoralCalendarResponse> {
  const calendarDoc = createElectoralCalendarDocument(calendarData, userEmail);

  const result = await db.collection<ElectoralCalendarDocument>('calendars').insertOne(calendarDoc);
  const createdCalendar = await db
    .collection<ElectoralCalendarDocument>('calendars')
    .findOne({ _id: result.insertedId });

  if (createdCalendar === null) {
    throw new Error('Failed to retrieve newly created electoral calendar from database');
  }

  return createElectoralCalendarResponse(createdCalendar);
}

/**
 * Get all electoral calendars with optional filters
 */
export async function getAllElectoralCalendars(
  db: Db,
  filters: ElectoralCalendarFilters = {},
): Promise<ElectoralCalendarResponse[]> {
  const query: Partial<ElectoralCalendarDocument> = {};

  if (filters.election_id !== undefined) {
    query.election_id = filters.election_id;
  }

  if (filters.created_by !== undefined) {
    query.created_by = filters.created_by;
  }

  const calendars = await db
    .collection<ElectoralCalendarDocument>('calendars')
    .find(query)
    .sort({ created_at: -1 })
    .toArray();

  return calendars.map(createElectoralCalendarResponse);
}

/**
 * Get a single electoral calendar by ID
 */
export async function getElectoralCalendarById(
  db: Db,
  calendarId: string,
): Promise<ElectoralCalendarResponse | null> {
  if (!ObjectId.isValid(calendarId)) {
    throw new Error('INVALID_CALENDAR_ID');
  }

  const calendar = await db
    .collection<ElectoralCalendarDocument>('calendars')
    .findOne({ _id: new ObjectId(calendarId) });

  if (calendar === null) {
    return null;
  }

  return createElectoralCalendarResponse(calendar);
}

/**
 * Update an electoral calendar
 */
export async function updateElectoralCalendar(
  db: Db,
  calendarId: string,
  updateData: Partial<CreateElectoralCalendarData>,
): Promise<ElectoralCalendarResponse | null> {
  if (!ObjectId.isValid(calendarId)) {
    throw new Error('INVALID_CALENDAR_ID');
  }

  const now = new Date();
  const updates: Partial<ElectoralCalendarDocument> = {
    ...(updateData as Partial<ElectoralCalendarDocument>),
    updated_at: now,
  };

  const result = await db
    .collection<ElectoralCalendarDocument>('calendars')
    .findOneAndUpdate(
      { _id: new ObjectId(calendarId) },
      { $set: updates },
      { returnDocument: 'after' },
    );

  if (result === null) {
    return null;
  }

  return createElectoralCalendarResponse(result);
}

/**
 * Delete an electoral calendar
 */
export async function deleteElectoralCalendar(db: Db, calendarId: string): Promise<boolean> {
  if (!ObjectId.isValid(calendarId)) {
    throw new Error('INVALID_CALENDAR_ID');
  }

  const result = await db
    .collection<ElectoralCalendarDocument>('calendars')
    .deleteOne({ _id: new ObjectId(calendarId) });

  return result.deletedCount > 0;
}
