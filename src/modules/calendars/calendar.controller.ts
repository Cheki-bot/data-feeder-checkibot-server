import { Response } from 'express';
import { validationResult } from 'express-validator';
import * as CalendarService from './calendar.service';
import { AuthRequest, getDb } from '../../types/authInterfaces';
import { CreateElectoralCalendarData } from './calendar.model';

interface ElectoralCalendarQuery {
  election_id?: string;
}

/**
 * POST /api/calendars
 * Create a new electoral calendar (Admin only)
 */
export async function createCalendar(req: AuthRequest, res: Response): Promise<void> {
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
    const calendarData = req.body as CreateElectoralCalendarData;
    const userEmail = req.currentUser?.email;

    if (userEmail === undefined) {
      res.status(401).json({
        message: 'User not authenticated',
        ok: false,
        status: 401,
      });
      return;
    }

    const calendar = await CalendarService.createElectoralCalendar(db, calendarData, userEmail);

    res.status(201).json({
      message: 'Electoral calendar created successfully',
      ok: true,
      status: 201,
      data: calendar,
    });
  } catch (error) {
    console.error('Create electoral calendar error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: message,
    });
  }
}

/**
 * GET /api/calendars
 * Get all electoral calendars
 * - Users can see all calendars
 * - Admins can see all calendars
 */
export async function getAllCalendars(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDb(req);
    const { election_id } = req.query as ElectoralCalendarQuery;

    const filters: CalendarService.ElectoralCalendarFilters = {};

    if (election_id !== undefined) {
      filters.election_id = election_id;
    }

    const calendars = await CalendarService.getAllElectoralCalendars(db, filters);

    res.json({
      message: 'Electoral calendars retrieved successfully',
      ok: true,
      status: 200,
      data: calendars,
    });
  } catch (error) {
    console.error('Get all electoral calendars error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: message,
    });
  }
}

/**
 * GET /api/calendars/:id
 * Get a single electoral calendar by ID
 */
export async function getCalendarById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDb(req);
    const { id } = req.params;

    const calendar = await CalendarService.getElectoralCalendarById(db, id);

    if (calendar === null) {
      res.status(404).json({
        message: 'Electoral calendar not found',
        ok: false,
        status: 404,
      });
      return;
    }

    res.json({
      message: 'Electoral calendar retrieved successfully',
      ok: true,
      status: 200,
      data: calendar,
    });
  } catch (error) {
    console.error('Get electoral calendar by ID error:', error);

    if (error instanceof Error && error.message === 'INVALID_CALENDAR_ID') {
      res.status(400).json({
        message: 'Invalid electoral calendar ID format',
        ok: false,
        status: 400,
      });
      return;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: message,
    });
  }
}

/**
 * PATCH /api/calendars/:id
 * Update an electoral calendar
 */
export async function updateCalendar(req: AuthRequest, res: Response): Promise<void> {
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
    const existingCalendar = await CalendarService.getElectoralCalendarById(db, id);

    if (existingCalendar === null) {
      res.status(404).json({
        message: 'Electoral calendar not found',
        ok: false,
        status: 404,
      });
      return;
    }

    const updateData = req.body as Partial<CreateElectoralCalendarData>;
    const updatedCalendar = await CalendarService.updateElectoralCalendar(db, id, updateData);

    res.json({
      message: 'Electoral calendar updated successfully',
      ok: true,
      status: 200,
      data: updatedCalendar,
    });
  } catch (error) {
    console.error('Update electoral calendar error:', error);

    if (error instanceof Error && error.message === 'INVALID_CALENDAR_ID') {
      res.status(400).json({
        message: 'Invalid electoral calendar ID format',
        ok: false,
        status: 400,
      });
      return;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: message,
    });
  }
}

/**
 * DELETE /api/calendars/:id
 * Delete an electoral calendar
 */
export async function deleteCalendar(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = getDb(req);
    const { id } = req.params;

    // Check if electoral calendar exists
    const existingCalendar = await CalendarService.getElectoralCalendarById(db, id);

    if (existingCalendar === null) {
      res.status(404).json({
        message: 'Electoral calendar not found',
        ok: false,
        status: 404,
      });
      return;
    }

    const deleted = await CalendarService.deleteElectoralCalendar(db, id);

    if (!deleted) {
      res.status(500).json({
        message: 'Failed to delete electoral calendar',
        ok: false,
        status: 500,
      });
      return;
    }

    res.json({
      message: 'Electoral calendar deleted successfully',
      ok: true,
      status: 200,
    });
  } catch (error) {
    console.error('Delete electoral calendar error:', error);

    if (error instanceof Error && error.message === 'INVALID_CALENDAR_ID') {
      res.status(400).json({
        message: 'Invalid electoral calendar ID format',
        ok: false,
        status: 400,
      });
      return;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Server error',
      ok: false,
      status: 500,
      error: message,
    });
  }
}
