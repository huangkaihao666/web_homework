import { Controller, Get } from '@nestjs/common';
import { DashboardService, DashboardStats, SalesData, CategoryData, OrderInfo } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(): Promise<DashboardStats> {
    return this.dashboardService.getStats();
  }

  @Get('sales')
  async getRecentSales(): Promise<SalesData[]> {
    return this.dashboardService.getRecentSales();
  }

  @Get('categories')
  async getCategoryDistribution(): Promise<CategoryData[]> {
    return this.dashboardService.getCategoryDistribution();
  }

  @Get('recent-orders')
  async getRecentOrders(): Promise<OrderInfo[]> {
    return this.dashboardService.getRecentOrders();
  }
} 