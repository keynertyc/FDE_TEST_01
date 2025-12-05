import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get('DATABASE_HOST') || 'localhost',
  port: configService.get('DATABASE_PORT') || 3306,
  username: configService.get('DATABASE_USER') || 'portal_user',
  password: configService.get('DATABASE_PASSWORD') || 'portal_password',
  database: configService.get('DATABASE_NAME') || 'client_portal',
  entities: ['src/entities/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/**/*{.ts,.js}'],
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'development',
});
