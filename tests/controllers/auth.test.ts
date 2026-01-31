import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../index';
import User, { IUser } from '../../model/users.model';
import { token, refreshToken, userId, getRefreshToken } from '../setup';

describe('Authentication Controller Tests', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: 'securePassword123',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
    expect(res.body.user).toHaveProperty('_id');
    expect(res.body.user.email).toBe('john.doe@example.com');
  });

  it('should return 400 if username already exists during registration', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser', // Same as setup user
        email: 'different@example.com',
        password: 'securePassword123',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Username or email already exists!');
  });

  it('should return 400 if email already exists during registration', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'john_doe2',
        email: 'testuser@example.com',
        password: 'securePassword123',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Username or email already exists!');
  });

  it('should return 500 if an error occurs during registration', async () => {
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => { });
    jest.spyOn(User, 'create').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: 'securePassword123',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Registration failed');

    mockError.mockRestore();
    jest.restoreAllMocks();
  });

  it('should log in an existing user successfully', async () => {
    const password = await bcrypt.hash('securePassword123', 10);
    await User.create({
      username: 'john_doe',
      email: 'john.doe@example.com',
      password,
    });

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'securePassword123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should return 400 for invalid credentials during login (user not found)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'invalid@example.com',
        password: 'wrongPassword',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('should return 400 for invalid credentials when password does not match during login', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'wrongPassword',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('should return 500 if an error occurs during login', async () => {
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => { });
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'securePassword123',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Login failed');

    mockError.mockRestore();
    jest.restoreAllMocks();
  });

  it('should log out a user and invalidate the refresh token', async () => {
    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Logged out successfully');

    const updatedUser = await User.findById(userId).select('+refreshToken');
    expect(updatedUser?.refreshToken).toBeNull();
  });

  it('should return 403 for logout without authentication', async () => {
    const res = await request(app)
      .post('/auth/logout');

    expect(res.statusCode).toBe(403);
  });

  it('should refresh the access token successfully', async () => {
    const res = await request(app)
      .post('/auth/refresh-token')
      .send({ refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('should return 400 for an invalid refresh token during refresh', async () => {
    const res = await request(app)
      .post('/auth/refresh-token')
      .send({ refreshToken: 'invalidToken' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid or expired refresh token');
  }, 10000);

  it('should return 403 if refresh token is invalid during refresh', async () => {
    const res = await request(app)
      .post('/auth/refresh-token')
      .send({ refreshToken: getRefreshToken(userId) });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Invalid refresh token');
  });

  it('should return 400 for a missing refresh token during refresh', async () => {
    const res = await request(app).post('/auth/refresh-token');

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Refresh token required');
  });

  describe('Direct Controller Tests - Logout', () => {
    it('should return 403 if req.user is missing (middleware bypassed)', async () => {
      const req: any = { user: undefined };
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const authController = require('../../controller/auth.controller').default;
      await authController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not Authorized!' });
    });

    it('should return 500 if logout/save fails', async () => {
      const mockUser = {
        save: jest.fn().mockRejectedValue(new Error('Save failed')),
        refreshToken: 'someToken'
      };
      const req: any = { user: mockUser };
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const authController = require('../../controller/auth.controller').default;
      await authController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Logout failed' });
    });
  });
});
