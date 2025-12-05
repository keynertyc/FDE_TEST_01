import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment, Project } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Project])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
