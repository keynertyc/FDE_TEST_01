import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, User, UserRole, ProjectStatus } from '../entities';

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  recentProjects?: Project[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async getStats(user: User): Promise<DashboardStats> {
    const queryBuilder = this.projectsRepository.createQueryBuilder('project');

    // Clients only see their own projects
    if (user.role === UserRole.CLIENT) {
      queryBuilder.where('project.clientId = :userId', { userId: user.id });
    }

    const totalProjects = await queryBuilder.getCount();

    const activeProjects = await this.projectsRepository.count({
      where:
        user.role === UserRole.CLIENT
          ? { status: ProjectStatus.ACTIVE, clientId: user.id }
          : { status: ProjectStatus.ACTIVE },
    });

    const completedProjects = await this.projectsRepository.count({
      where:
        user.role === UserRole.CLIENT
          ? { status: ProjectStatus.COMPLETED, clientId: user.id }
          : { status: ProjectStatus.COMPLETED },
    });

    const onHoldProjects = await this.projectsRepository.count({
      where:
        user.role === UserRole.CLIENT
          ? { status: ProjectStatus.ON_HOLD, clientId: user.id }
          : { status: ProjectStatus.ON_HOLD },
    });

    // Get recent projects
    const recentQuery = this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('project.createdBy', 'createdBy')
      .orderBy('project.createdAt', 'DESC')
      .limit(5);

    if (user.role === UserRole.CLIENT) {
      recentQuery.where('project.clientId = :userId', { userId: user.id });
    }

    const recentProjects = await recentQuery.getMany();

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      recentProjects,
    };
  }
}
