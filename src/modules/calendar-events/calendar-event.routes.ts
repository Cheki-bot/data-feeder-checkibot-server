import { Router } from 'express';
import { authenticateToken, getCurrentUser } from '../../middleware/auth';
import * as CalendarEventController from './calendar-event.controller';
import {
  createCalendarEventValidation,
  updateCalendarEventValidation,
  calendarEventIdParamValidation,
} from '../../validators/calendar-event';

const router = Router();

router.use(authenticateToken, getCurrentUser);

/**
 * @openapi
 * components:
 *   schemas:
 *     CalendarEvent:
 *       type: object
 *       required:
 *         - scenery
 *         - no
 *         - activity
 *         - days
 *         - from_date
 *         - to_date
 *         - duration
 *         - reference
 *         - place
 *         - calendar_id
 *       properties:
 *         scenery:
 *           type: string
 *         no:
 *           type: integer
 *         activity:
 *           type: string
 *         days:
 *           type: integer
 *         from_date:
 *           type: string
 *           format: date-time
 *         to_date:
 *           type: string
 *           format: date-time
 *         duration:
 *           type: integer
 *         reference:
 *           type: string
 *         place:
 *           type: string
 *         calendar_id:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @openapi
 * /calendar-events:
 *   post:
 *     summary: Create a calendar event
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CalendarEvent'
 *     responses:
 *       201:
 *         description: Calendar event created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', createCalendarEventValidation, CalendarEventController.createEvent);

/**
 * @openapi
 * /calendar-events:
 *   get:
 *     summary: Get all calendar events (users see their own; admins see all)
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of calendar events
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', CalendarEventController.getAllEvents);

/**
 * @openapi
 * /calendar-events/{id}:
 *   get:
 *     summary: Get a calendar event by ID
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Calendar event found
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - can only access own events
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', calendarEventIdParamValidation, CalendarEventController.getEventById);

/**
 * @openapi
 * /calendar-events/{id}:
 *   patch:
 *     summary: Update a calendar event
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CalendarEvent'
 *     responses:
 *       200:
 *         description: Calendar event updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - can only update own events
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  '/:id',
  calendarEventIdParamValidation,
  updateCalendarEventValidation,
  CalendarEventController.updateEvent,
);

/**
 * @openapi
 * /calendar-events/{id}:
 *   delete:
 *     summary: Delete a calendar event
 *     tags: [Calendar Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Calendar event deleted
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', calendarEventIdParamValidation, CalendarEventController.deleteEvent);

export default router;
