import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from '../routes/index.js';
import { notFoundHandler, errorHandler } from '../middleware/errorHandler.js';

let app, db, mongoServer, client;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db('test_checkibot_db');

  await db.collection('users').createIndex({ email: 1 }, { unique: true });

  process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
  process.env.ADMIN_EMAIL = 'admin@test.com';
  process.env.ADMIN_PASSWORD = 'test_admin_password_123';

  app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.locals.db = db;

  app.use('/api', routes);
  app.use(notFoundHandler);
  app.use(errorHandler);
});

afterAll(async () => {
  await client.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await db.collection('users').deleteMany({});
});

describe('Authentication System', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'newuser@example.com',
        password: 'password123',
        role: 'User',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('email', 'newuser@example.com');
      expect(response.body).toHaveProperty('role', 'User');
      expect(response.body).toHaveProperty('is_active', true);
      expect(response.body).toHaveProperty('created_at');
      expect(response.body).not.toHaveProperty('password_hash');
    });

    test('should fail with duplicate email', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'duplicate@example.com',
        password: 'password123',
      });

      const response = await request(app).post('/api/auth/register').send({
        email: 'duplicate@example.com',
        password: 'differentpass456',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already registered');
    });

    test('should fail with password shorter than 8 characters', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'shortpass@example.com',
        password: 'short',
      });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    test('should fail with invalid email format', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'not-an-email',
        password: 'password123',
      });

      expect(response.status).toBe(400);
    });

    test('should default role to User if not specified', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'norole@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe('User');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        email: 'testuser@example.com',
        password: 'password123',
        role: 'User',
      });
    });

    test('should login successfully with valid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'testuser@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('token_type', 'bearer');
      expect(typeof response.body.access_token).toBe('string');
      expect(response.body.access_token.length).toBeGreaterThan(0);
    });

    test('should fail with invalid credentials (wrong password)', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'testuser@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should fail with non-existent user', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should fail with deactivated account', async () => {
      await db
        .collection('users')
        .updateOne(
          { email: 'testuser@example.com' },
          { $set: { is_active: false } }
        );

      const response = await request(app).post('/api/auth/login').send({
        email: 'testuser@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('deactivated');
    });

    test('should lock account after 5 failed login attempts', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app).post('/api/auth/login').send({
          email: 'testuser@example.com',
          password: 'wrongpassword',
        });
      }

      const response = await request(app).post('/api/auth/login').send({
        email: 'testuser@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('locked');
    });

    test('should show remaining attempts after failed login', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'testuser@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('4 attempts remaining');
    });

    test('should reset failed attempts after successful login', async () => {
      for (let i = 0; i < 3; i++) {
        await request(app).post('/api/auth/login').send({
          email: 'testuser@example.com',
          password: 'wrongpassword',
        });
      }

      const successResponse = await request(app).post('/api/auth/login').send({
        email: 'testuser@example.com',
        password: 'password123',
      });

      expect(successResponse.status).toBe(200);

      const user = await db
        .collection('users')
        .findOne({ email: 'testuser@example.com' });
      expect(user.failed_attempts).toBe(0);
    });

    test('should auto-unlock account after lockout period expires', async () => {
      const pastDate = new Date(Date.now() - 10 * 60 * 1000);

      await db.collection('users').updateOne(
        { email: 'testuser@example.com' },
        {
          $set: {
            failed_attempts: 5,
            lockout_until: pastDate,
          },
        }
      );

      const response = await request(app).post('/api/auth/login').send({
        email: 'testuser@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
    });
  });

  describe('GET /api/auth/me', () => {
    let userToken;

    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        email: 'testuser@example.com',
        password: 'password123',
        role: 'User',
      });

      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'testuser@example.com',
        password: 'password123',
      });

      userToken = loginResponse.body.access_token;
    });

    test('should get current user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'testuser@example.com');
      expect(response.body).toHaveProperty('role', 'User');
      expect(response.body).not.toHaveProperty('password_hash');
    });

    test('should fail without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('No token provided');
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token_here');

      expect(response.status).toBe(401);
    });

    test('should fail with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat');

      expect(response.status).toBe(401);
    });
  });

  describe('Admin Operations', () => {
    let adminToken, userToken;

    beforeEach(async () => {
      // Create admin user
      await request(app).post('/api/auth/register').send({
        email: 'admin@example.com',
        password: 'adminpass123',
        role: 'Admin',
      });

      const adminLogin = await request(app).post('/api/auth/login').send({
        email: 'admin@example.com',
        password: 'adminpass123',
      });

      adminToken = adminLogin.body.access_token;

      await request(app).post('/api/auth/register').send({
        email: 'regularuser@example.com',
        password: 'userpass123',
        role: 'User',
      });

      const userLogin = await request(app).post('/api/auth/login').send({
        email: 'regularuser@example.com',
        password: 'userpass123',
      });

      userToken = userLogin.body.access_token;
    });

    describe('PATCH /api/auth/users/:email/deactivate', () => {
      test('should allow admin to deactivate user account', async () => {
        const response = await request(app)
          .patch('/api/auth/users/regularuser@example.com/deactivate')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toContain('deactivated');

        const loginResponse = await request(app).post('/api/auth/login').send({
          email: 'regularuser@example.com',
          password: 'userpass123',
        });

        expect(loginResponse.status).toBe(403);
      });

      test('should fail when non-admin tries to deactivate account', async () => {
        const response = await request(app)
          .patch('/api/auth/users/admin@example.com/deactivate')
          .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
        expect(response.body.message).toContain('Admin access required');
      });

      test('should return 404 for non-existent user', async () => {
        const response = await request(app)
          .patch('/api/auth/users/nonexistent@example.com/deactivate')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
      });
    });

    describe('PATCH /api/auth/users/:email/activate', () => {
      test('should allow admin to activate deactivated account', async () => {
        await db
          .collection('users')
          .updateOne(
            { email: 'regularuser@example.com' },
            { $set: { is_active: false } }
          );

        const response = await request(app)
          .patch('/api/auth/users/regularuser@example.com/activate')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toContain('activated');

        const loginResponse = await request(app).post('/api/auth/login').send({
          email: 'regularuser@example.com',
          password: 'userpass123',
        });

        expect(loginResponse.status).toBe(200);
      });

      test('should fail when non-admin tries to activate account', async () => {
        const response = await request(app)
          .patch('/api/auth/users/admin@example.com/activate')
          .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
      });
    });

    describe('DELETE /api/auth/users/:email', () => {
      test('should allow admin to delete user account', async () => {
        const response = await request(app)
          .delete('/api/auth/users/regularuser@example.com')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toContain('deleted permanently');

        const user = await db
          .collection('users')
          .findOne({ email: 'regularuser@example.com' });
        expect(user).toBeNull();
      });

      test('should fail when non-admin tries to delete account', async () => {
        const response = await request(app)
          .delete('/api/auth/users/admin@example.com')
          .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
      });

      test('should prevent admin from deleting their own account', async () => {
        const response = await request(app)
          .delete('/api/auth/users/admin@example.com')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Cannot delete your own account');
      });

      test('should return 404 for non-existent user', async () => {
        const response = await request(app)
          .delete('/api/auth/users/nonexistent@example.com')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
      });
    });

    describe('GET /api/auth/users', () => {
      test('should allow admin to list all users', async () => {
        const response = await request(app)
          .get('/api/auth/users')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('users');
        expect(response.body).toHaveProperty('count');
        expect(Array.isArray(response.body.users)).toBe(true);
        expect(response.body.count).toBeGreaterThanOrEqual(2);

        response.body.users.forEach(user => {
          expect(user).not.toHaveProperty('password_hash');
        });
      });

      test('should fail when non-admin tries to list users', async () => {
        const response = await request(app)
          .get('/api/auth/users')
          .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
      });
    });
  });
});
