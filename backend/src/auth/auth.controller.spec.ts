import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserRole } from '../entities';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;

  const mockUser: User = {
    id: 'user-id',
    email: 'test@test.com',
    name: 'Test User',
    role: UserRole.CLIENT,
  } as User;

  beforeEach(async () => {
    // Arrange - Mock service
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      getMe: jest.fn(),
      searchByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const registerDto = {
        email: 'new@test.com',
        password: 'password123',
        name: 'New User',
        role: UserRole.CLIENT,
      };

      const expectedResponse = {
        user: { id: 'new-id', email: registerDto.email, name: registerDto.name },
        accessToken: 'jwt-token',
      };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login user and return access token', async () => {
      // Arrange
      const loginDto = {
        email: 'test@test.com',
        password: 'password123',
      };

      const expectedResponse = {
        user: mockUser,
        accessToken: 'jwt-token',
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.login(loginDto, mockUser);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('getMe', () => {
    it('should return current user data', async () => {
      // Arrange
      const expectedUser = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      };

      mockAuthService.getMe.mockResolvedValue(expectedUser);

      // Act
      const result = await controller.getMe(mockUser);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockAuthService.getMe).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('searchUsers', () => {
    it('should search users by email', async () => {
      // Arrange
      const email = 'client@test.com';
      const expectedUsers = [
        { id: '1', email: 'client1@test.com', name: 'Client 1' },
        { id: '2', email: 'client2@test.com', name: 'Client 2' },
      ];

      mockAuthService.searchByEmail.mockResolvedValue(expectedUsers);

      // Act
      const result = await controller.searchUsers(email);

      // Assert
      expect(result).toEqual(expectedUsers);
      expect(mockAuthService.searchByEmail).toHaveBeenCalledWith(email);
    });
  });
});
