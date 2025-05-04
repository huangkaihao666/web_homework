import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  login(loginDto: LoginDto) {
    const user = this.usersService.findByUsername(loginDto.username);
    
    if (!user || user.password !== loginDto.password) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    
    // 实际应用中应该返回JWT或其他类型的token
    const { password, ...result } = user;
    return {
      user: result,
      token: 'mock-jwt-token'
    };
  }

  register(registerDto: RegisterDto) {
    // 实际应用中应该对密码进行哈希处理
    return this.usersService.create({
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password,
    });
  }
} 