import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project, User, UserRole, ProjectStatus } from '../entities';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockProjectsRepository: any;

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
    // Arrange - Mock repository
    mockProjectsRepository = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectsRepository,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return stats for admin with all projects', async () => {
      // Arrange
      const mockRecentProjects = [
        { id: '1', name: 'Project 1', status: ProjectStatus.ACTIVE },
        { id: '2', name: 'Project 2', status: ProjectStatus.COMPLETED },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(10),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockRecentProjects),
      };

      mockProjectsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockProjectsRepository.count
        .mockResolvedValueOnce(5) // active
        .mockResolvedValueOnce(3) // completed
        .mockResolvedValueOnce(2); // on hold

      // Act
      const result = await service.getStats(mockAdminUser);

      // Assert
      expect(result).toEqual({
        totalProjects: 10,
        activeProjects: 5,
        completedProjects: 3,
        onHoldProjects: 2,
        recentProjects: mockRecentProjects,
      });
      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
    });

    it('should return stats for client with only their projects', async () => {
      // Arrange
      const mockRecentProjects = [
        { id: '1', name: 'Client Project 1', status: ProjectStatus.ACTIVE, clientId: mockClientUser.id },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(3),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockRecentProjects),
      };

      mockProjectsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockProjectsRepository.count
        .mockResolvedValueOnce(2) // active
        .mockResolvedValueOnce(1) // completed
        .mockResolvedValueOnce(0); // on hold

      // Act
      const result = await service.getStats(mockClientUser);

      // Assert
      expect(result).toEqual({
        totalProjects: 3,
        activeProjects: 2,
        completedProjects: 1,
        onHoldProjects: 0,
        recentProjects: mockRecentProjects,
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('project.clientId = :userId', {
        userId: mockClientUser.id,
      });
    });

    it('should count projects by status correctly for admin', async () => {
      // Arrange
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(15),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockProjectsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockProjectsRepository.count
        .mockResolvedValueOnce(8) // active
        .mockResolvedValueOnce(5) // completed
        .mockResolvedValueOnce(2); // on hold

      // Act
      const result = await service.getStats(mockAdminUser);

      // Assert
      expect(result.activeProjects).toBe(8);
      expect(result.completedProjects).toBe(5);
      expect(result.onHoldProjects).toBe(2);
      expect(mockProjectsRepository.count).toHaveBeenCalledTimes(3);
    });

    it('should count projects by status correctly for client', async () => {
      // Arrange
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(5),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockProjectsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockProjectsRepository.count
        .mockResolvedValueOnce(3) // active
        .mockResolvedValueOnce(2) // completed
        .mockResolvedValueOnce(0); // on hold

      // Act
      const result = await service.getStats(mockClientUser);

      // Assert
      expect(result.activeProjects).toBe(3);
      expect(result.completedProjects).toBe(2);
      expect(result.onHoldProjects).toBe(0);
      expect(mockProjectsRepository.count).toHaveBeenCalledWith({
        where: { status: ProjectStatus.ACTIVE, clientId: mockClientUser.id },
      });
    });
  });
});
