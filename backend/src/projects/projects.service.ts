import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, User, UserRole } from '../entities';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    const { clientId, ...projectData } = createProjectDto;

    // Validate client if provided
    if (clientId) {
      const client = await this.usersRepository.findOne({
        where: { id: clientId, role: UserRole.CLIENT },
      });

      if (!client) {
        throw new BadRequestException('Invalid client ID or user is not a client');
      }
    }

    const project = this.projectsRepository.create({
      ...projectData,
      clientId: clientId || null,
      createdById: userId,
    });

    return await this.projectsRepository.save(project);
  }

  async findAll(user: User): Promise<Project[]> {
    const query = this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('project.createdBy', 'createdBy');

    // Clients can only see their own projects
    if (user.role === UserRole.CLIENT) {
      query.where('project.clientId = :userId', { userId: user.id });
    }

    return await query.orderBy('project.createdAt', 'DESC').getMany();
  }

  async findOne(id: string, user: User): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['client', 'createdBy', 'comments', 'comments.user'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Clients can only access their own projects
    if (user.role === UserRole.CLIENT && project.clientId !== user.id) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user: User): Promise<Project> {
    const project = await this.findOne(id, user);

    const { clientId, ...updateData } = updateProjectDto;

    // Validate client if provided
    if (clientId !== undefined) {
      if (clientId === null) {
        project.clientId = null;
      } else {
        const client = await this.usersRepository.findOne({
          where: { id: clientId, role: UserRole.CLIENT },
        });

        if (!client) {
          throw new BadRequestException('Invalid client ID or user is not a client');
        }

        project.clientId = clientId;
      }
    }

    Object.assign(project, updateData);

    return await this.projectsRepository.save(project);
  }

  async remove(id: string, user: User): Promise<void> {
    const project = await this.findOne(id, user);
    await this.projectsRepository.remove(project);
  }

  async getProjectsByStatus(status: string, user: User): Promise<Project[]> {
    const query = this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client')
      .where('project.status = :status', { status });

    if (user.role === UserRole.CLIENT) {
      query.andWhere('project.clientId = :userId', { userId: user.id });
    }

    return await query.getMany();
  }
}
