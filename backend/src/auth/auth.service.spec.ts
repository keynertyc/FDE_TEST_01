import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../entities';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersRepository: any;
  let mockJwtService: any;

  beforeEach(async () => {
    // Arrange - Mock repository
    mockUsersRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      const registerDto = {
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
        role: UserRole.CLIENT,
      };

      mockUsersRepository.findOne.mockResolvedValue(null);
      mockUsersRepository.create.mockReturnValue({
        ...registerDto,
        id: '123',
      });
      mockUsersRepository.save.mockResolvedValue({
        ...registerDto,
        id: '123',
      });

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('should throw ConflictException if email exists', async () => {
      // Arrange
      const registerDto = {
        email: 'existing@test.com',
        password: 'password123',
        name: 'Test User',
      };

      mockUsersRepository.findOne.mockResolvedValue({ id: '123' });

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      // Arrange
      const email = 'test@test.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      mockUsersRepository.findOne.mockResolvedValue({
        id: '123',
        email,
        password: hashedPassword,
      });

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(email);
    });

    it('should return null if user not found', async () => {
      // Arrange
      mockUsersRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.validateUser('nonexistent@test.com', 'password');

      // Assert
      expect(result).toBeNull();
    });
  });
});
