import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { User, UserRole, ProjectStatus } from '../entities';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let mockProjectsService: any;

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
    // Arrange - Mock service
    mockProjectsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new project', async () => {
      // Arrange
      const createProjectDto = {
        name: 'New Project',
        description: 'Project description',
        status: ProjectStatus.ACTIVE,
        clientId: mockClientUser.id,
      };

      const expectedProject = {
        id: 'project-id',
        ...createProjectDto,
        createdById: mockAdminUser.id,
      };

      mockProjectsService.create.mockResolvedValue(expectedProject);

      // Act
      const result = await controller.create(createProjectDto, mockAdminUser);

      // Assert
      expect(result).toEqual(expectedProject);
      expect(mockProjectsService.create).toHaveBeenCalledWith(createProjectDto, mockAdminUser.id);
    });
  });

  describe('findAll', () => {
    it('should return all projects for admin', async () => {
      // Arrange
      const expectedProjects = [
        { id: '1', name: 'Project 1', status: ProjectStatus.ACTIVE },
        { id: '2', name: 'Project 2', status: ProjectStatus.COMPLETED },
      ];

      mockProjectsService.findAll.mockResolvedValue(expectedProjects);

      // Act
      const result = await controller.findAll(mockAdminUser);

      // Assert
      expect(result).toEqual(expectedProjects);
      expect(mockProjectsService.findAll).toHaveBeenCalledWith(mockAdminUser);
    });

    it('should return only client projects for client user', async () => {
      // Arrange
      const expectedProjects = [
        { id: '1', name: 'Client Project', status: ProjectStatus.ACTIVE, clientId: mockClientUser.id },
      ];

      mockProjectsService.findAll.mockResolvedValue(expectedProjects);

      // Act
      const result = await controller.findAll(mockClientUser);

      // Assert
      expect(result).toEqual(expectedProjects);
      expect(mockProjectsService.findAll).toHaveBeenCalledWith(mockClientUser);
    });
  });

  describe('findOne', () => {
    it('should return a project by id', async () => {
      // Arrange
      const projectId = 'project-id';
      const expectedProject = {
        id: projectId,
        name: 'Test Project',
        status: ProjectStatus.ACTIVE,
      };

      mockProjectsService.findOne.mockResolvedValue(expectedProject);

      // Act
      const result = await controller.findOne(projectId, mockAdminUser);

      // Assert
      expect(result).toEqual(expectedProject);
      expect(mockProjectsService.findOne).toHaveBeenCalledWith(projectId, mockAdminUser);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      // Arrange
      const projectId = 'project-id';
      const updateProjectDto = {
        name: 'Updated Project',
        status: ProjectStatus.COMPLETED,
      };

      const expectedProject = {
        id: projectId,
        ...updateProjectDto,
      };

      mockProjectsService.update.mockResolvedValue(expectedProject);

      // Act
      const result = await controller.update(projectId, updateProjectDto, mockAdminUser);

      // Assert
      expect(result).toEqual(expectedProject);
      expect(mockProjectsService.update).toHaveBeenCalledWith(
        projectId,
        updateProjectDto,
        mockAdminUser,
      );
    });
  });

  describe('remove', () => {
    it('should delete a project', async () => {
      // Arrange
      const projectId = 'project-id';
      mockProjectsService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(projectId, mockAdminUser);

      // Assert
      expect(result).toEqual({ message: 'Project deleted successfully' });
      expect(mockProjectsService.remove).toHaveBeenCalledWith(projectId, mockAdminUser);
    });
  });
});
