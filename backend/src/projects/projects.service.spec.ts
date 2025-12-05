import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project, User, UserRole, ProjectStatus } from '../entities';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockProjectsRepository: any;
  let mockUsersRepository: any;

  const mockAdminUser: User = {
    id: 'admin-id',
    email: 'admin@test.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
  } as User;

  const mockClientUser: User = {
    id: 'client-id',
    email: 'client@test.com',
    name: 'Client User',
    role: UserRole.CLIENT,
  } as User;

  beforeEach(async () => {
    // Arrange - Mock repositories
    mockProjectsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getCount: jest.fn(),
      })),
      count: jest.fn(),
    };

    mockUsersRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectsRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a project successfully', async () => {
      // Arrange
      const createProjectDto = {
        name: 'Test Project',
        description: 'Test Description',
        status: ProjectStatus.ACTIVE,
      };

      const mockProject = {
        id: 'project-id',
        ...createProjectDto,
        createdById: mockAdminUser.id,
      };

      mockProjectsRepository.create.mockReturnValue(mockProject);
      mockProjectsRepository.save.mockResolvedValue(mockProject);

      // Act
      const result = await service.create(createProjectDto, mockAdminUser.id);

      // Assert
      expect(result).toEqual(mockProject);
      expect(mockProjectsRepository.create).toHaveBeenCalled();
      expect(mockProjectsRepository.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a project for admin user', async () => {
      // Arrange
      const mockProject = {
        id: 'project-id',
        name: 'Test Project',
        clientId: mockClientUser.id,
      };

      mockProjectsRepository.findOne.mockResolvedValue(mockProject);

      // Act
      const result = await service.findOne('project-id', mockAdminUser);

      // Assert
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException if project not found', async () => {
      // Arrange
      mockProjectsRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('nonexistent-id', mockAdminUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if client tries to access other client project', async () => {
      // Arrange
      const mockProject = {
        id: 'project-id',
        name: 'Test Project',
        clientId: 'different-client-id',
      };

      mockProjectsRepository.findOne.mockResolvedValue(mockProject);

      // Act & Assert
      await expect(service.findOne('project-id', mockClientUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all projects for admin', async () => {
      // Arrange
      const mockProjects = [
        { id: '1', name: 'Project 1' },
        { id: '2', name: 'Project 2' },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockProjects),
      };

      mockProjectsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.findAll(mockAdminUser);

      // Assert
      expect(result).toEqual(mockProjects);
      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
    });

    it('should return only client projects for client user', async () => {
      // Arrange
      const mockProjects = [{ id: '1', name: 'Client Project' }];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockProjects),
      };

      mockProjectsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.findAll(mockClientUser);

      // Assert
      expect(result).toEqual(mockProjects);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('project.clientId = :userId', {
        userId: mockClientUser.id,
      });
    });
  });
});
