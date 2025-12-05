import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Project } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
