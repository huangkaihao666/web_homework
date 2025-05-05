import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrderDto, OrderStatus } from './dto/order.dto';

@Injectable()
export class OrdersService {
  private readonly orders = [
    {
      id: 'ORD10001',
      userId: 1,
      status: 'PENDING',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      totalAmount: 5998,
      recipientName: '张三',
      phoneNumber: '13812345678',
      address: '北京市海淀区中关村大街1号',
      zipCode: '100080',
      paymentMethod: 'ALIPAY',
      deliveryMethod: 'EXPRESS',
      items: [
        {
          id: 1,
          name: '高端智能手机',
          price: 4999,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp',
        },
        {
          id: 2,
          name: '手机保护壳',
          price: 999,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp',
        },
      ],
    },
    {
      id: 'ORD10002',
      userId: 1,
      status: 'PAID',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      totalAmount: 6999,
      recipientName: '张三',
      phoneNumber: '13812345678',
      address: '北京市海淀区中关村大街1号',
      zipCode: '100080',
      paymentMethod: 'WECHAT',
      deliveryMethod: 'STANDARD',
      items: [
        {
          id: 3,
          name: '超薄笔记本电脑',
          price: 6999,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp',
        },
      ],
    },
    {
      id: 'ORD10003',
      userId: 1,
      status: 'SHIPPED',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      totalAmount: 299,
      recipientName: '张三',
      phoneNumber: '13812345678',
      address: '北京市海淀区中关村大街1号',
      zipCode: '100080',
      paymentMethod: 'CREDIT_CARD',
      deliveryMethod: 'EXPRESS',
      items: [
        {
          id: 4,
          name: '时尚休闲上衣',
          price: 299,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp',
        },
      ],
    },
    {
      id: 'ORD12345',
      userId: 1,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      totalAmount: 5998,
      recipientName: '张三',
      phoneNumber: '13812345678',
      address: '北京市海淀区中关村大街1号',
      zipCode: '100080',
      paymentMethod: 'ALIPAY',
      deliveryMethod: 'EXPRESS',
      items: [
        {
          id: 1,
          productId: 101,
          name: '高端智能手机',
          price: 4999,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp',
        },
        {
          id: 2,
          productId: 102,
          name: '手机保护壳',
          price: 999,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp',
        },
      ],
    },
    {
      id: 'ORD12346',
      userId: 1,
      status: 'PAID',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 昨天
      totalAmount: 6999,
      recipientName: '张三',
      phoneNumber: '13812345678',
      address: '北京市海淀区中关村大街1号',
      zipCode: '100080',
      paymentMethod: 'WECHAT',
      deliveryMethod: 'STANDARD',
      items: [
        {
          id: 3,
          productId: 103,
          name: '超薄笔记本电脑',
          price: 6999,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp',
        },
      ],
    },
    {
      id: 'ORD12347',
      userId: 1,
      status: 'SHIPPED',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 前天
      totalAmount: 299,
      recipientName: '张三',
      phoneNumber: '13812345678',
      address: '北京市海淀区中关村大街1号',
      zipCode: '100080',
      paymentMethod: 'CREDIT_CARD',
      deliveryMethod: 'EXPRESS',
      items: [
        {
          id: 4,
          productId: 104,
          name: '时尚休闲上衣',
          price: 299,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp',
        },
      ],
    },
    {
      id: 'ORD12348',
      userId: 2, // 另一个用户
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      totalAmount: 8999,
      recipientName: '李四',
      phoneNumber: '13987654321',
      address: '上海市浦东新区陆家嘴',
      zipCode: '200120',
      paymentMethod: 'ALIPAY',
      deliveryMethod: 'EXPRESS',
      items: [
        {
          id: 5,
          productId: 105,
          name: '高端相机',
          price: 8999,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp',
        },
      ],
    },
  ];

  findAll() {
    // 返回所有订单，实际应用中应根据权限过滤
    return this.orders;
  }

  findOne(id: string) {
    const order = this.orders.find((order) => order.id === id);
    if (!order) {
      throw new NotFoundException(`订单ID ${id} 未找到`);
    }
    return order;
  }

  findByUser(userId: number) {
    // 根据用户ID过滤订单
    return this.orders.filter((order) => order.userId === userId);
  }

  create(createOrderDto: CreateOrderDto) {
    // 记录收到的订单数据
    console.log('收到订单创建请求, 数据:', JSON.stringify(createOrderDto, null, 2));
    
    if (!createOrderDto.userId || isNaN(createOrderDto.userId)) {
      console.error('订单创建失败: 无效的用户ID', createOrderDto.userId);
      throw new BadRequestException(`无效的用户ID: ${createOrderDto.userId}`);
    }
    
    // 实际应用中，这里应该涉及到获取商品价格、计算总金额等逻辑
    const totalAmount = createOrderDto.items.reduce((sum, item) => {
      // 假设我们已经验证了商品和价格
      return sum + (item.price || 0) * item.quantity;
    }, 0);
    
    // 确保每个订单项目都有价格
    const processedItems = createOrderDto.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price || 0,  // 确保价格总是有值
    }));
    
    const newId = this.generateOrderId();
    console.log(`生成新订单ID: ${newId}`);
    
    // 创建完整的订单对象
    const newOrder = {
      id: newId,
      userId: createOrderDto.userId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      totalAmount,
      recipientName: createOrderDto.recipientName || '未提供姓名',
      phoneNumber: createOrderDto.phoneNumber || '未提供电话',
      address: createOrderDto.address || '未提供地址',
      zipCode: createOrderDto.zipCode || '000000',
      paymentMethod: createOrderDto.paymentMethod || 'ALIPAY',
      deliveryMethod: createOrderDto.deliveryMethod || 'EXPRESS',
      items: processedItems.map((item, index) => {
        // 从DTO中提取商品的额外信息
        const originalItem = createOrderDto.items.find(i => i.productId === item.productId) || {};
        
        // 安全地访问可能不存在的属性
        const productName = (originalItem as any).productName;
        const imgUrl = (originalItem as any).imgUrl;
        
        return {
          id: index + 1,
          productId: item.productId,
          // 使用前端提供的商品名称，如果没有则使用默认名称
          name: productName || `商品${item.productId}`,
          price: item.price,
          quantity: item.quantity,
          // 使用前端提供的图片URL，如果没有则使用默认图片
          imgUrl: imgUrl || 'https://img.alicdn.com/imgextra/i1/O1CN01m1hzc21lOX95MCcbf_!!6000000004809-0-tps-2880-1070.jpg',
        };
      }),
    };
    
    this.orders.push(newOrder);
    console.log(`订单创建成功: ${newId}, 用户ID: ${newOrder.userId}`);
    return newOrder;
  }

  updateStatus(id: string | number, status: OrderStatus) {
    const idStr = typeof id === 'number' ? id.toString() : id;
    const order = this.findOne(idStr);
    
    console.log(`正在更新订单 ${idStr} 的状态为 ${status}`);
    
    // 检查订单状态变更的合法性
    if (order.status === 'CANCELLED') {
      console.error(`订单 ${idStr} 已取消，不能更改状态`);
      throw new BadRequestException('已取消的订单不能更改状态');
    }
    
    if (
      order.status === 'COMPLETED' &&
      status !== OrderStatus.CANCELLED
    ) {
      console.error(`订单 ${idStr} 已完成，只能取消不能更改为其他状态`);
      throw new BadRequestException('已完成的订单只能取消不能更改为其他状态');
    }
    
    // 更新订单状态
    const index = this.orders.findIndex((o) => o.id === idStr);
    this.orders[index].status = status;
    
    console.log(`订单 ${idStr} 状态更新成功为 ${status}`);
    return this.orders[index];
  }

  private generateOrderId(): string {
    // 简单的实现方式，实际应用中应该更复杂
    return (
      'ORD' +
      (Math.max(...this.orders.map((o) => parseInt(o.id.slice(3)))) + 1)
        .toString()
        .padStart(5, '0')
    );
  }

  // 获取指定用户的所有订单
  findByUserId(userId: number) {
    console.log(`查询用户 ${userId} 的订单`);
    return this.orders.filter((order) => order.userId === userId);
  }
} 