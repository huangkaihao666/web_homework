import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  private users = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      password: '123456', // 实际应用中应该使用哈希密码
      avatar: 'https://via.placeholder.com/150',
      role: 'admin'
    },
    {
      id: 2,
      username: 'user1',
      email: 'user1@example.com',
      password: '123456', // 实际应用中应该使用哈希密码
      avatar: 'https://via.placeholder.com/150',
      role: 'user'
    }
  ];

  findAll() {
    return this.users.map(user => {
      const { password, ...result } = user;
      return result;
    });
  }

  findOne(id: number) {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 未找到`);
    }
    
    const { password, ...result } = user;
    return result;
  }

  findByUsername(username: string) {
    return this.users.find(u => u.username === username);
  }

  create(createUserDto: CreateUserDto) {
    const existingUser = this.users.find(
      u => u.username === createUserDto.username || u.email === createUserDto.email
    );
    
    if (existingUser) {
      throw new ConflictException('用户名或邮箱已存在');
    }
    
    const newId = Math.max(...this.users.map(u => u.id)) + 1;
    const newUser = {
      id: newId,
      ...createUserDto,
      role: 'user'
    };
    
    this.users.push(newUser);
    
    const { password, ...result } = newUser;
    return result;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`用户ID ${id} 未找到`);
    }
    
    if (updateUserDto.username) {
      const existingUser = this.users.find(
        u => u.username === updateUserDto.username && u.id !== id
      );
      
      if (existingUser) {
        throw new ConflictException('用户名已存在');
      }
    }
    
    if (updateUserDto.email) {
      const existingUser = this.users.find(
        u => u.email === updateUserDto.email && u.id !== id
      );
      
      if (existingUser) {
        throw new ConflictException('邮箱已存在');
      }
    }
    
    this.users[index] = {
      ...this.users[index],
      ...updateUserDto
    };
    
    const { password, ...result } = this.users[index];
    return result;
  }

  remove(id: number) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`用户ID ${id} 未找到`);
    }
    
    const { password, ...result } = this.users[index];
    this.users.splice(index, 1);
    
    return result;
  }
} 