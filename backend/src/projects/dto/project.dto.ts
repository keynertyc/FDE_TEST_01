import { IsString, MinLength, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '../../entities/project.entity';

export class CreateProjectDto {
  @ApiProperty({ example: 'Project Alpha', minLength: 3 })
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  name: string;

  @ApiProperty({ example: 'This is a detailed description', minLength: 10 })
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  description: string;

  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid client ID' })
  clientId?: string;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'Project Alpha', minLength: 3 })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  name?: string;

  @ApiPropertyOptional({ example: 'This is a detailed description', minLength: 10 })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  description?: string;

  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid client ID' })
  clientId?: string | null;
}
