import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { OrdersService } from '../orders/orders.service';

// 统一的图片URL
const DEFAULT_IMAGE_URL = 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp';

@Injectable()
export class UsersService {
  constructor(private readonly ordersService: OrdersService) {}
  
  private users = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      password: '123456', // 实际应用中应该使用哈希密码
      avatar: DEFAULT_IMAGE_URL,
      role: 'admin'
    },
    {
      id: 2,
      username: 'user1',
      email: 'user1@example.com',
      password: '123456', // 实际应用中应该使用哈希密码
      avatar: DEFAULT_IMAGE_URL,
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
  
  findUserOrders(userId: number) {
    // 首先确认用户存在
    this.findOne(userId);
    
    // 获取所有订单
    const allOrders = this.ordersService.findAll();
    
    // 过滤出该用户的订单
    return allOrders.filter(order => order.userId === userId);
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
      username: createUserDto.username,
      email: createUserDto.email,
      password: createUserDto.password,
      avatar: DEFAULT_IMAGE_URL,  // 始终使用默认头像
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
      ...updateUserDto,
      // 确保头像始终是默认头像
      avatar: DEFAULT_IMAGE_URL
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