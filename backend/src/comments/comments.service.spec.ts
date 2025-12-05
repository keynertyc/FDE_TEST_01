import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment, Project, User, UserRole } from '../entities';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;
  let mockCommentsRepository: any;
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
    // Arrange - Mock repositories
    mockCommentsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    mockProjectsRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentsRepository,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectsRepository,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment successfully for admin', async () => {
      // Arrange
      const projectId = 'project-id';
      const createCommentDto = { content: 'Test comment' };
      
      const mockProject = {
        id: projectId,
        clientId: 'other-client-id',
      };

      const mockComment = {
        id: 'comment-id',
        content: createCommentDto.content,
        projectId,
        userId: mockAdminUser.id,
      };

      const mockCommentWithUser = {
        ...mockComment,
        user: mockAdminUser,
      };

      mockProjectsRepository.findOne.mockResolvedValue(mockProject);
      mockCommentsRepository.create.mockReturnValue(mockComment);
      mockCommentsRepository.save.mockResolvedValue(mockComment);
      mockCommentsRepository.findOne.mockResolvedValue(mockCommentWithUser);

      // Act
      const result = await service.create(projectId, createCommentDto, mockAdminUser);

      // Assert
      expect(result).toEqual(mockCommentWithUser);
      expect(mockCommentsRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockComment.id },
        relations: ['user'],
      });
    });

    it('should create a comment for client on their own project', async () => {
      // Arrange
      const projectId = 'project-id';
      const createCommentDto = { content: 'Client comment' };
      
      const mockProject = {
        id: projectId,
        clientId: mockClientUser.id,
      };

      const mockComment = {
        id: 'comment-id',
        content: createCommentDto.content,
        projectId,
        userId: mockClientUser.id,
      };

      const mockCommentWithUser = {
        ...mockComment,
        user: mockClientUser,
      };

      mockProjectsRepository.findOne.mockResolvedValue(mockProject);
      mockCommentsRepository.create.mockReturnValue(mockComment);
      mockCommentsRepository.save.mockResolvedValue(mockComment);
      mockCommentsRepository.findOne.mockResolvedValue(mockCommentWithUser);

      // Act
      const result = await service.create(projectId, createCommentDto, mockClientUser);

      // Assert
      expect(result).toEqual(mockCommentWithUser);
    });

    it('should throw NotFoundException if project does not exist', async () => {
      // Arrange
      const projectId = 'nonexistent-id';
      const createCommentDto = { content: 'Test comment' };
      
      mockProjectsRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.create(projectId, createCommentDto, mockAdminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if client tries to comment on other client project', async () => {
      // Arrange
      const projectId = 'project-id';
      const createCommentDto = { content: 'Test comment' };
      
      const mockProject = {
        id: projectId,
        clientId: 'different-client-id',
      };

      mockProjectsRepository.findOne.mockResolvedValue(mockProject);

      // Act & Assert
      await expect(
        service.create(projectId, createCommentDto, mockClientUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllByProject', () => {
    it('should return all comments for a project for admin', async () => {
      // Arrange
      const projectId = 'project-id';
      const mockProject = {
        id: projectId,
        clientId: 'client-id',
      };

      const mockComments = [
        {
          id: 'comment-1',
          content: 'Comment 1',
          user: mockAdminUser,
        },
        {
          id: 'comment-2',
          content: 'Comment 2',
          user: mockClientUser,
        },
      ];

      mockProjectsRepository.findOne.mockResolvedValue(mockProject);
      mockCommentsRepository.find.mockResolvedValue(mockComments);

      // Act
      const result = await service.findAllByProject(projectId, mockAdminUser);

      // Assert
      expect(result).toEqual(mockComments);
      expect(mockCommentsRepository.find).toHaveBeenCalledWith({
        where: { projectId },
        relations: ['user'],
        order: { createdAt: 'ASC' },
      });
    });

    it('should return comments for client on their own project', async () => {
      // Arrange
      const projectId = 'project-id';
      const mockProject = {
        id: projectId,
        clientId: mockClientUser.id,
      };

      const mockComments = [
        {
          id: 'comment-1',
          content: 'Comment 1',
          user: mockClientUser,
        },
      ];

      mockProjectsRepository.findOne.mockResolvedValue(mockProject);
      mockCommentsRepository.find.mockResolvedValue(mockComments);

      // Act
      const result = await service.findAllByProject(projectId, mockClientUser);

      // Assert
      expect(result).toEqual(mockComments);
    });

    it('should throw NotFoundException if project does not exist', async () => {
      // Arrange
      const projectId = 'nonexistent-id';
      
      mockProjectsRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findAllByProject(projectId, mockAdminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if client tries to access other client project comments', async () => {
      // Arrange
      const projectId = 'project-id';
      const mockProject = {
        id: projectId,
        clientId: 'different-client-id',
      };

      mockProjectsRepository.findOne.mockResolvedValue(mockProject);

      // Act & Assert
      await expect(
        service.findAllByProject(projectId, mockClientUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
