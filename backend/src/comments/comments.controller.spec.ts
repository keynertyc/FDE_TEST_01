import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { User, UserRole } from '../entities';

describe('CommentsController', () => {
  let controller: CommentsController;
  let mockCommentsService: any;

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
    mockCommentsService = {
      create: jest.fn(),
      findAllByProject: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment for a project', async () => {
      // Arrange
      const projectId = 'project-id';
      const createCommentDto = { content: 'Test comment' };
      
      const expectedComment = {
        id: 'comment-id',
        content: createCommentDto.content,
        projectId,
        userId: mockAdminUser.id,
        user: mockAdminUser,
      };

      mockCommentsService.create.mockResolvedValue(expectedComment);

      // Act
      const result = await controller.create(projectId, createCommentDto, mockAdminUser);

      // Assert
      expect(result).toEqual(expectedComment);
      expect(mockCommentsService.create).toHaveBeenCalledWith(
        projectId,
        createCommentDto,
        mockAdminUser,
      );
    });

    it('should allow client to comment on their project', async () => {
      // Arrange
      const projectId = 'project-id';
      const createCommentDto = { content: 'Client comment' };
      
      const expectedComment = {
        id: 'comment-id',
        content: createCommentDto.content,
        projectId,
        userId: mockClientUser.id,
        user: mockClientUser,
      };

      mockCommentsService.create.mockResolvedValue(expectedComment);

      // Act
      const result = await controller.create(projectId, createCommentDto, mockClientUser);

      // Assert
      expect(result).toEqual(expectedComment);
      expect(mockCommentsService.create).toHaveBeenCalledWith(
        projectId,
        createCommentDto,
        mockClientUser,
      );
    });
  });

  describe('findAll', () => {
    it('should return all comments for a project', async () => {
      // Arrange
      const projectId = 'project-id';
      const expectedComments = [
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

      mockCommentsService.findAllByProject.mockResolvedValue(expectedComments);

      // Act
      const result = await controller.findAll(projectId, mockAdminUser);

      // Assert
      expect(result).toEqual(expectedComments);
      expect(mockCommentsService.findAllByProject).toHaveBeenCalledWith(projectId, mockAdminUser);
    });

    it('should return comments for client on their project', async () => {
      // Arrange
      const projectId = 'project-id';
      const expectedComments = [
        {
          id: 'comment-1',
          content: 'Comment 1',
          user: mockClientUser,
        },
      ];

      mockCommentsService.findAllByProject.mockResolvedValue(expectedComments);

      // Act
      const result = await controller.findAll(projectId, mockClientUser);

      // Assert
      expect(result).toEqual(expectedComments);
      expect(mockCommentsService.findAllByProject).toHaveBeenCalledWith(projectId, mockClientUser);
    });
  });
});
