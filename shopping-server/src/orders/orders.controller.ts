import { Controller, Get, Post, Body, Param, Put, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    console.log(`接收到订单状态更新请求，订单ID: ${id}, 状态: ${updateOrderStatusDto.status}`);
    return this.ordersService.updateStatus(id, updateOrderStatusDto.status);
  }

  @Get('user/:userId')
  getUserOrders(@Param('userId') userId: string) {
    const userIdNumber = parseInt(userId, 10);
    if (isNaN(userIdNumber)) {
      throw new BadRequestException('用户ID必须是数字');
    }
    
    return this.ordersService.findByUserId(userIdNumber);
  }
} 