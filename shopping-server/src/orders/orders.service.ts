import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrderDto, OrderStatus } from './dto/order.dto';

@Injectable()
export class OrdersService {
  private orders = [
    {
      id: 100001,
      userId: 2,
      items: [
        { productId: 1, quantity: 2, price: 299 },
        { productId: 3, quantity: 1, price: 99 }
      ],
      totalAmount: 697,
      status: OrderStatus.COMPLETED,
      createdAt: '2024-05-01 14:23:12',
      shippingAddress: '北京市海淀区',
      contactPhone: '13812345678'
    },
    {
      id: 100002,
      userId: 2,
      items: [
        { productId: 2, quantity: 1, price: 599 }
      ],
      totalAmount: 599,
      status: OrderStatus.SHIPPED,
      createdAt: '2024-05-02 09:45:30',
      shippingAddress: '上海市浦东新区',
      contactPhone: '13912345678'
    },
    {
      id: 100003,
      userId: 2,
      items: [
        { productId: 1, quantity: 1, price: 299 },
        { productId: 2, quantity: 1, price: 599 },
        { productId: 3, quantity: 1, price: 99 }
      ],
      totalAmount: 997,
      status: OrderStatus.PENDING_PAYMENT,
      createdAt: '2024-05-02 16:12:08',
      shippingAddress: '广州市天河区',
      contactPhone: '13712345678'
    }
  ];

  findAll() {
    return this.orders;
  }

  findOne(id: number) {
    const order = this.orders.find(o => o.id === id);
    if (!order) {
      throw new NotFoundException(`订单ID ${id} 未找到`);
    }
    return order;
  }

  create(createOrderDto: CreateOrderDto) {
    // 实际应用中，这里应该涉及到获取商品价格、计算总金额等逻辑
    const totalAmount = createOrderDto.items.reduce((sum, item) => {
      // 假设我们已经验证了商品和价格
      return sum + ((item.price || 0) * item.quantity);
    }, 0);
    
    const newId = this.generateOrderId();
    const newOrder = {
      id: newId,
      ...createOrderDto,
      totalAmount,
      status: OrderStatus.PENDING_PAYMENT,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    
    this.orders.push(newOrder);
    return newOrder;
  }

  updateStatus(id: number, status: OrderStatus) {
    const order = this.findOne(id);
    
    // 检查订单状态变更的合法性
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('已取消的订单不能更改状态');
    }
    
    if (order.status === OrderStatus.COMPLETED && status !== OrderStatus.CANCELLED) {
      throw new BadRequestException('已完成的订单只能取消不能更改为其他状态');
    }
    
    // 更新订单状态
    const index = this.orders.findIndex(o => o.id === id);
    this.orders[index].status = status;
    
    return this.orders[index];
  }

  private generateOrderId(): number {
    // 简单的实现方式，实际应用中应该更复杂
    return Math.max(...this.orders.map(o => o.id)) + 1;
  }
} 