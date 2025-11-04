import { Router } from 'express';
import {
  createCalendarValidation,
  updateCalendarValidation,
  calendarIdParamValidation,
} from '../../validators/calendar';
import { authenticateToken, getCurrentUser } from '../../middleware/auth';
import * as CalendarController from './calendar.controller';

const router = Router();

router.use(authenticateToken, getCurrentUser);

/**
 * @openapi
 * components:
 *   schemas:
 *     CalendarSignature:
 *       type: object
 *       required:
 *         - full_name
 *         - position
 *       properties:
 *         full_name:
 *           type: string
 *           description: Full name of the signatory
 *           example: Juan Pérez García
 *         position:
 *           type: string
 *           description: Position or title
 *           example: Vocal del Tribunal Electoral
 *     CalendarEvent:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Event ID
 *         scenery:
 *           type: string
 *           description: Scenery or context
 *           example: Escenario 1
 *         no:
 *           type: integer
 *           description: Event number
 *           example: 1
 *         activity:
 *           type: string
 *           description: Activity description
 *           example: Convocatoria a elecciones
 *         days:
 *           type: integer
 *           description: Number of days
 *           example: 5
 *         from_date:
 *           type: string
 *           format: date-time
 *           description: Start date
 *         to_date:
 *           type: string
 *           format: date-time
 *           description: End date
 *         duration:
 *           type: integer
 *           description: Duration in days
 *           example: 5
 *         reference:
 *           type: string
 *           description: Legal reference
 *           example: Art. 123 de la CPE
 *         place:
 *           type: string
 *           description: Place where the event occurs
 *           example: La Paz, Bolivia
 *         calendar_id:
 *           type: string
 *           description: Associated calendar ID
 *     ElectoralCalendar:
 *       type: object
 *       required:
 *         - pdf_url
 *         - title
 *         - resolution
 *         - date
 *         - signatures
 *         - events
 *         - election_id
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier
 *         pdf_url:
 *           type: string
 *           format: uri
 *           description: URL to the PDF document
 *           example: https://example.com/calendar.pdf
 *         title:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *           description: Calendar title
 *           example: Calendario Electoral 2025
 *         resolution:
 *           type: string
 *           description: Associated resolution
 *           example: Resolución TSE-RSP-0001/2025
 *         date:
 *           type: string
 *           format: date-time
 *           description: Calendar date
 *         introduction:
 *           type: string
 *           description: Optional introduction text
 *         signatures:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CalendarSignature'
 *         events:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CalendarEvent'
 *         election_id:
 *           type: string
 *           description: Associated election ID
 *         created_by:
 *           type: string
 *           description: Email of the creator
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /calendars:
 *   post:
 *     summary: Create a new electoral calendar
 *     description: Create a new electoral calendar (Authenticated users)
 *     tags: [Electoral Calendars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pdf_url
 *               - title
 *               - resolution
 *               - date
 *               - signatures
 *               - events
 *               - election_id
 *             properties:
 *               pdf_url:
 *                 type: string
 *                 format: uri
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *               resolution:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               introduction:
 *                 type: string
 *               signatures:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CalendarSignature'
 *               events:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CalendarEvent'
 *               election_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Electoral calendar created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Electoral calendar created successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 201
 *                 data:
 *                   $ref: '#/components/schemas/ElectoralCalendar'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 400
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 401
 *       403:
 *         description: Forbidden - Requires authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 403
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 500
 */
// Create calendar (Authenticated users)
router.post('/', createCalendarValidation, CalendarController.createCalendar);

/**
 * @openapi
 * /calendars:
 *   get:
 *     summary: Get all electoral calendars
 *     description: Retrieve all electoral calendars with optional filtering
 *     tags: [Electoral Calendars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: election_id
 *         schema:
 *           type: string
 *         description: Filter by election ID
 *     responses:
 *       200:
 *         description: List of electoral calendars
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Electoral calendars retrieved successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ElectoralCalendar'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 401
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 500
 */
// Get all calendars
router.get('/', CalendarController.getAllCalendars);

/**
 * @openapi
 * /calendars/{id}:
 *   get:
 *     summary: Get an electoral calendar by ID
 *     description: Retrieve a single electoral calendar
 *     tags: [Electoral Calendars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Electoral calendar ID
 *     responses:
 *       200:
 *         description: Electoral calendar found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Electoral calendar retrieved successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/ElectoralCalendar'
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 400
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 401
 *       404:
 *         description: Electoral calendar not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 404
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 500
 */
// Get single calendar by ID
router.get('/:id', calendarIdParamValidation, CalendarController.getCalendarById);

/**
 * @openapi
 * /calendars/{id}:
 *   patch:
 *     summary: Update an electoral calendar
 *     description: Update an electoral calendar (Authenticated users)
 *     tags: [Electoral Calendars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Electoral calendar ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pdf_url:
 *                 type: string
 *                 format: uri
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *               resolution:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               introduction:
 *                 type: string
 *               signatures:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CalendarSignature'
 *               events:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CalendarEvent'
 *               election_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Electoral calendar updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Electoral calendar updated successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/ElectoralCalendar'
 *       400:
 *         description: Validation error or invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 400
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 401
 *       403:
 *         description: Forbidden - Requires authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 403
 *       404:
 *         description: Electoral calendar not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 404
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 500
 */
// Update calendar (Authenticated users)
router.patch(
  '/:id',
  calendarIdParamValidation,
  updateCalendarValidation,
  CalendarController.updateCalendar,
);

/**
 * @openapi
 * /calendars/{id}:
 *   delete:
 *     summary: Delete an electoral calendar
 *     description: Delete an electoral calendar (Authenticated users)
 *     tags: [Electoral Calendars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Electoral calendar ID
 *     responses:
 *       200:
 *         description: Electoral calendar deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Electoral calendar deleted successfully
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: number
 *                   example: 200
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 400
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 401
 *       403:
 *         description: Forbidden - Requires authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 403
 *       404:
 *         description: Electoral calendar not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 404
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: number
 *                   example: 500
 */
// Delete calendar (Authenticated users)
router.delete('/:id', calendarIdParamValidation, CalendarController.deleteCalendar);

export default router;
