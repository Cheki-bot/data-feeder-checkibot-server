import { Response } from 'express';
import { validationResult } from 'express-validator';
import { ROLES } from '../../constants/roles';
import { AuthRequest, getDb } from '../../types/authInterfaces';
import {
  createCalendarEvent,
  getAllCalendarEvents,
  getCalendarEventById,
  updateCalendarEvent,
  deleteCalendarEvent,
  CalendarEventFilters,
} from './calendar-event.service';
import { CreateCalendarEventData } from './calendar-event.model';

interface CalendarEventQuery {
  calendar_id?: string;
}

export async function createEvent(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Validation failed',
      ok: false,
      status: 400,
      errors: errors.array(),
    });
    return;
  }

  try {
    const db = getDb(req);
    const data = req.body as CreateCalendarEventData;
    const userEmail = req.currentUser?.email;

    if (userEmail === undefined) {
      res.status(401).json({ message: 'User not authenticated', ok: false, status: 401 });
      return;
    }

    const created = await createCalendarEvent(db, data, userEmail);
    res.status(201).json({
      message: 'Calendar event created successfully',
      ok: true,
      status: 201,
      data: created,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create calendar event error:', error);
    res.status(500).json({ message: 'Server error', ok: false, status: 500, error: message });
  }
}

export async function getAllEvents(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDb(req);
    const { calendar_id } = req.query as CalendarEventQuery;

    const filters: CalendarEventFilters = {};
    if (req.currentUser !== undefined && req.currentUser.role !== ROLES.ADMIN) {
      filters.created_by = req.currentUser.email;
    }
    if (calendar_id !== undefined) filters.calendar_id = calendar_id;

    const events = await getAllCalendarEvents(db, filters);
    res.json({
      message: 'Calendar events retrieved successfully',
      ok: true,
      status: 200,
      data: events,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get all calendar events error:', error);
    res.status(500).json({ message: 'Server error', ok: false, status: 500, error: message });
  }
}

export async function getEventById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDb(req);
    const { id } = req.params;

    const event = await getCalendarEventById(db, id);
    if (event === null) {
      res.status(404).json({ message: 'Calendar event not found', ok: false, status: 404 });
      return;
    }

    if (
      req.currentUser !== undefined &&
      req.currentUser.role !== ROLES.ADMIN &&
      event.created_by !== req.currentUser.email
    ) {
      res.status(403).json({
        message: 'You can only access your own calendar events',
        ok: false,
        status: 403,
      });
      return;
    }

    res.json({
      message: 'Calendar event retrieved successfully',
      ok: true,
      status: 200,
      data: event,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CALENDAR_EVENT_ID') {
      res.status(400).json({ message: 'Invalid calendar event ID format', ok: false, status: 400 });
      return;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get calendar event by ID error:', error);
    res.status(500).json({ message: 'Server error', ok: false, status: 500, error: message });
  }
}

export async function updateEvent(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Validation failed',
      ok: false,
      status: 400,
      errors: errors.array(),
    });
    return;
  }

  try {
    const db = getDb(req);
    const { id } = req.params;

    const existing = await getCalendarEventById(db, id);
    if (existing === null) {
      res.status(404).json({ message: 'Calendar event not found', ok: false, status: 404 });
      return;
    }

    if (
      req.currentUser !== undefined &&
      req.currentUser.role !== ROLES.ADMIN &&
      existing.created_by !== req.currentUser.email
    ) {
      res.status(403).json({
        message: 'You can only update your own calendar events',
        ok: false,
        status: 403,
      });
      return;
    }

    const updateData = req.body as Partial<CreateCalendarEventData>;
    const updated = await updateCalendarEvent(db, id, updateData);

    res.json({
      message: 'Calendar event updated successfully',
      ok: true,
      status: 200,
      data: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CALENDAR_EVENT_ID') {
      res.status(400).json({ message: 'Invalid calendar event ID format', ok: false, status: 400 });
      return;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update calendar event error:', error);
    res.status(500).json({ message: 'Server error', ok: false, status: 500, error: message });
  }
}

export async function deleteEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDb(req);
    const { id } = req.params;

    const existing = await getCalendarEventById(db, id);
    if (existing === null) {
      res.status(404).json({ message: 'Calendar event not found', ok: false, status: 404 });
      return;
    }

    const deleted = await deleteCalendarEvent(db, id);
    if (!deleted) {
      res.status(500).json({ message: 'Failed to delete calendar event', ok: false, status: 500 });
      return;
    }

    res.json({ message: 'Calendar event deleted successfully', ok: true, status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CALENDAR_EVENT_ID') {
      res.status(400).json({ message: 'Invalid calendar event ID format', ok: false, status: 400 });
      return;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Delete calendar event error:', error);
    res.status(500).json({ message: 'Server error', ok: false, status: 500, error: message });
  }
}
