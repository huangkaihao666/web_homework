import { IsNotEmpty, IsNumber, IsArray, ValidateNested, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderStatus {
  PENDING_PAYMENT = '待付款',
  PAID = '已付款',
  SHIPPED = '已发货',
  COMPLETED = '已完成',
  CANCELLED = '已取消',
}

export class OrderItemDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  price?: number;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  shippingAddress?: string;

  @IsOptional()
  contactPhone?: string;
}

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
} 