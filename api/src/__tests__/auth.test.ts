import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/auth';
import { errorHandler } from '../middleware/errorHandler';

type Role = 'USER' | 'MODERATOR' | 'ADMIN';

type UserRecord = {
  id: string;
  email: string;
  username: string;
  password: string;
  role: Role;
  createdAt: Date;
};

type RefreshTokenRecord = {
  token: string;
  userId: string;
  expiresAt: Date;
};

const mockStore: { users: UserRecord[]; refreshTokens: RefreshTokenRecord[] } = {
  users: [],
  refreshTokens: [],
};

jest.mock('../lib/prisma', () => {
  let idCounter = 1;

  return {
    prisma: {
      user: {
        findFirst: jest.fn(async ({ where }: any) => {
          const orFilters = where?.OR ?? [];
          return (
            mockStore.users.find(
              (user) =>
                orFilters.some((filter: any) =>
                  (filter.email && filter.email === user.email) ||
                  (filter.username && filter.username === user.username)
                )
            ) ?? null
          );
        }),
        findUnique: jest.fn(async ({ where }: any) => {
          if (where?.username) {
            return mockStore.users.find((user) => user.username === where.username) ?? null;
          }
          if (where?.email) {
            return mockStore.users.find((user) => user.email === where.email) ?? null;
          }
          if (where?.id) {
            return mockStore.users.find((user) => user.id === where.id) ?? null;
          }
          return null;
        }),
        create: jest.fn(async ({ data, select }: any) => {
          const user: UserRecord = {
            id: `user-${idCounter++}`,
            email: data.email,
            username: data.username,
            password: data.password,
            role: 'USER',
            createdAt: new Date(),
          };

          mockStore.users.push(user);

          if (!select) {
            return user;
          }

          return Object.keys(select).reduce((acc, key) => {
            if (select[key]) {
              (acc as any)[key] = (user as any)[key];
            }
            return acc;
          }, {} as Record<string, unknown>);
        }),
        update: jest.fn(async ({ where, data }: any) => {
          const user = mockStore.users.find((item) => item.id === where.id);
          if (!user) {
            return null;
          }
          user.password = data.password;
          return user;
        }),
        deleteMany: jest.fn(async ({ where }: any) => {
          const original = mockStore.users.length;
          mockStore.users = mockStore.users.filter(
            (user) => !(where?.email?.contains && user.email.includes(where.email.contains))
          );
          return { count: original - mockStore.users.length };
        }),
      },
      refreshToken: {
        create: jest.fn(async ({ data }: any) => {
          const record: RefreshTokenRecord = {
            token: data.token,
            userId: data.userId,
            expiresAt: data.expiresAt,
          };
          mockStore.refreshTokens.push(record);
          return record;
        }),
        findFirst: jest.fn(async ({ where }: any) => {
          const nowCutoff = where?.expiresAt?.gt;
          return (
            mockStore.refreshTokens.find(
              (token) =>
                token.token === where?.token &&
                token.userId === where?.userId &&
                (!nowCutoff || token.expiresAt > nowCutoff)
            ) ?? null
          );
        }),
        deleteMany: jest.fn(async ({ where }: any) => {
          const original = mockStore.refreshTokens.length;
          mockStore.refreshTokens = mockStore.refreshTokens.filter((token) => {
            if (where?.token && token.token !== where.token) {
              return true;
            }
            if (where?.userId && token.userId !== where.userId) {
              return true;
            }
            return false;
          });
          return { count: original - mockStore.refreshTokens.length };
        }),
      },
      passwordResetToken: {
        deleteMany: jest.fn(async () => ({ count: 0 })),
        create: jest.fn(async () => null),
        findFirst: jest.fn(async () => null),
        delete: jest.fn(async () => null),
      },
      $disconnect: jest.fn(async () => undefined),
    },
  };
});

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

describe('Auth API', () => {
  beforeEach(() => {
    mockStore.users = [];
    mockStore.refreshTokens = [];
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.username).toBe('testuser');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });

      const res = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        username: 'testuser2',
        password: 'password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User already exists');
    });

    it('should validate required fields', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'invalid',
        username: 'ab',
        password: '123',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        username: 'testuser',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        username: 'testuser',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });

      const loginRes = await request(app).post('/api/auth/login').send({
        username: 'testuser',
        password: 'password123',
      });

      const cookies = loginRes.headers['set-cookie'] as unknown as string[];
      const refreshToken = cookies[0].split(';')[0].split('=')[1];

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should reject request without refresh token', async () => {
      const res = await request(app).post('/api/auth/refresh');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });

      const loginRes = await request(app).post('/api/auth/login').send({
        username: 'testuser',
        password: 'password123',
      });

      const accessToken = loginRes.body.token;
      const cookies = loginRes.headers['set-cookie'] as unknown as string[];
      const refreshToken = cookies[0].split(';')[0].split('=')[1];

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', [`refreshToken=${refreshToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });
});
