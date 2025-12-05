import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; accessToken: string }> {
    const { email, password, name, role } = registerDto;

    // Check if user exists
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
      role: role || UserRole.CLIENT,
    });

    try {
      await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Error creating user');
    }

    // Generate JWT
    const accessToken = this.generateToken(user);

    delete user.password;

    return { user, accessToken };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(user: User): Promise<{ user: User; accessToken: string }> {
    const accessToken = this.generateToken(user);

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  async getMe(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    delete user.password;
    return user;
  }

  async searchByEmail(email: string): Promise<User[]> {
    if (!email || email.length < 2) {
      return [];
    }

    const users = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email LIKE :email', { email: `%${email}%` })
      .andWhere('user.role = :role', { role: UserRole.CLIENT })
      .select(['user.id', 'user.email', 'user.name'])
      .limit(10)
      .getMany();

    return users;
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}
