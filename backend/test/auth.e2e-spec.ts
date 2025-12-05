import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let clientToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new admin user', async () => {
      // Arrange
      const registerDto = {
        email: 'admin@test.com',
        password: 'password123',
        name: 'Admin User',
        role: 'admin',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.email).toBe(registerDto.email);
      expect(response.body.user).not.toHaveProperty('password');

      adminToken = response.body.accessToken;
    });

    it('should register a new client user', async () => {
      // Arrange
      const registerDto = {
        email: 'client@test.com',
        password: 'password123',
        name: 'Client User',
        role: 'client',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      // Assert
      expect(response.body.user.role).toBe('client');
      clientToken = response.body.accessToken;
    });

    it('should fail with duplicate email', async () => {
      // Arrange
      const registerDto = {
        email: 'admin@test.com',
        password: 'password123',
        name: 'Duplicate User',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(409);
    });

    it('should fail with invalid email', async () => {
      // Arrange
      const registerDto = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(400);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should login with valid credentials', async () => {
      // Arrange
      const loginDto = {
        email: 'admin@test.com',
        password: 'password123',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.email).toBe(loginDto.email);
    });

    it('should fail with invalid credentials', async () => {
      // Arrange
      const loginDto = {
        email: 'admin@test.com',
        password: 'wrongpassword',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('/api/auth/me (GET)', () => {
    it('should get current user with valid token', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Assert
      expect(response.body.email).toBe('admin@test.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail without token', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });
  });
});
