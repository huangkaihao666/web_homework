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
          imgUrl: 'https://img.alicdn.com/imgextra/i1/6000000004230/O1CN01BIbRJ41hqjzOXQBBx_!!6000000004230-0-tbvideo.jpg',
        },
        {
          id: 2,
          name: '手机保护壳',
          price: 999,
          quantity: 1,
          imgUrl: 'https://img.alicdn.com/bao/uploaded/i2/2549841410/O1CN01wR1yTD1MNps7IQl4o_!!0-item_pic.jpg',
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
          imgUrl: 'https://img.alicdn.com/bao/uploaded/i3/1714128138/O1CN01DL5Jok29zFmPUJ08e_!!0-item_pic.jpg',
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
          imgUrl: 'https://img.alicdn.com/bao/uploaded/i2/2206686532409/O1CN01ZdIeOS1TfMnEJYJqJ_!!0-item_pic.jpg',
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
          imgUrl: 'https://img.alicdn.com/imgextra/i1/O1CN01m1hzc21lOX95MCcbf_!!6000000004809-0-tps-2880-1070.jpg',
        },
        {
          id: 2,
          productId: 102,
          name: '手机保护壳',
          price: 999,
          quantity: 1,
          imgUrl: 'https://img.alicdn.com/imgextra/i2/O1CN01AJQrI21QbIveZ33JI_!!6000000002001-0-tps-2880-1070.jpg',
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
          imgUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01LCoaYH1UmNEIlMsUB_!!6000000002568-0-tps-2880-1070.jpg',
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
          imgUrl: 'https://img.alicdn.com/imgextra/i1/O1CN01m1hzc21lOX95MCcbf_!!6000000004809-0-tps-2880-1070.jpg',
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
          imgUrl: 'https://img.alicdn.com/imgextra/i2/O1CN01AJQrI21QbIveZ33JI_!!6000000002001-0-tps-2880-1070.jpg',
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
      items: processedItems.map((item, index) => ({
        id: index + 1,
        productId: item.productId,
        name: `商品${item.productId}`,
        price: item.price,
        quantity: item.quantity,
        imgUrl: 'https://img.alicdn.com/imgextra/i1/O1CN01m1hzc21lOX95MCcbf_!!6000000004809-0-tps-2880-1070.jpg',
      })),
    };
    
    this.orders.push(newOrder);
    return newOrder;
  }

  updateStatus(id: number, status: OrderStatus) {
    const idStr = id.toString();
    const order = this.findOne(idStr);
    
    // 检查订单状态变更的合法性
    if (order.status === 'CANCELLED') {
      throw new BadRequestException('已取消的订单不能更改状态');
    }
    
    if (
      order.status === 'COMPLETED' &&
      status !== OrderStatus.CANCELLED
    ) {
      throw new BadRequestException('已完成的订单只能取消不能更改为其他状态');
    }
    
    // 更新订单状态
    const index = this.orders.findIndex((o) => o.id === idStr);
    this.orders[index].status = status;
    
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