import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'This is a comment', minLength: 1, maxLength: 2000 })
  @IsString()
  @MinLength(1, { message: 'Content cannot be empty' })
  @MaxLength(2000, { message: 'Content too long' })
  content: string;
}
