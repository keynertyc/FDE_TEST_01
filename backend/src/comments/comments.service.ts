import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, Project, User, UserRole } from '../entities';
import { CreateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(projectId: string, createCommentDto: CreateCommentDto, user: User): Promise<Comment> {
    // Verify project exists
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Clients can only comment on their own projects
    if (user.role === UserRole.CLIENT && project.clientId !== user.id) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const comment = this.commentsRepository.create({
      content: createCommentDto.content,
      projectId,
      userId: user.id,
    });

    const savedComment = await this.commentsRepository.save(comment);

    // Return comment with user relation
    return await this.commentsRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    }) as Comment;
  }

  async findAllByProject(projectId: string, user: User): Promise<Comment[]> {
    // Verify project exists and user has access
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (user.role === UserRole.CLIENT && project.clientId !== user.id) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return await this.commentsRepository.find({
      where: { projectId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }
}
