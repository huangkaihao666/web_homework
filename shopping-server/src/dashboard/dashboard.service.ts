import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { CategoriesService } from '../categories/categories.service';

export interface SalesData {
  date: string;
  amount: number;
}

export interface CategoryData {
  name: string;
  value: number;
}

export interface OrderInfo {
  id: string;
  user: string;
  amount: number;
  date: string;
  status: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private readonly categoriesService: CategoriesService,
  ) {}

  // 获取仪表盘基础统计数据
  async getStats(): Promise<DashboardStats> {
    const [users, products, orders] = await Promise.all([
      this.usersService.findAll(),
      this.productsService.findAll(null), // 传入null表示不按类别筛选
      this.ordersService.findAll(),
    ]);

    // 计算销售总额
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      totalUsers: users.length,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalSales,
    };
  }

  // 获取最近7天销售数据
  async getRecentSales(): Promise<SalesData[]> {
    const orders = await this.ordersService.findAll();
    const now = new Date();
    const recentSales: SalesData[] = [];

    // 获取最近7天的日期范围
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
      
      // 该日期的订单
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getDate() === date.getDate() && 
               orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear();
      });
      
      // 计算当天销售额
      const amount = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      recentSales.push({
        date: dateStr,
        amount,
      });
    }

    return recentSales;
  }

  // 获取商品类别分布
  async getCategoryDistribution(): Promise<CategoryData[]> {
    const categories = await this.categoriesService.findAll();
    const products = await this.productsService.findAll(null); // 传入null表示不按类别筛选
    
    // 为每个类别计算商品数量
    const distribution = categories.map(category => {
      const count = products.filter(product => product.categoryId === category.id).length;
      return {
        name: category.name,
        value: count,
      };
    });
    
    return distribution;
  }

  // 获取最近5个订单
  async getRecentOrders(): Promise<OrderInfo[]> {
    const allOrders = await this.ordersService.findAll();
    const orders = allOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    // 获取用户信息
    const ordersWithUserInfo = await Promise.all(
      orders.map(async order => {
        const user = await this.usersService.findOne(order.userId);
        return {
          id: order.id,
          user: user.username,
          amount: order.totalAmount,
          date: order.createdAt,
          status: order.status,
        };
      })
    );
    
    return ordersWithUserInfo;
  }
} 