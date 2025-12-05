import { Controller, Get, Post, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/comment.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../entities';

@ApiTags('Comments')
@Controller('projects/:projectId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Auth(UserRole.ADMIN, UserRole.CLIENT)
  @ApiOperation({ summary: 'Add comment to project' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.create(projectId, createCommentDto, user);
  }

  @Get()
  @Auth(UserRole.ADMIN, UserRole.CLIENT)
  @ApiOperation({ summary: 'Get all comments for a project' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findAll(@Param('projectId', ParseUUIDPipe) projectId: string, @CurrentUser() user: User) {
    return this.commentsService.findAllByProject(projectId, user);
  }
}
