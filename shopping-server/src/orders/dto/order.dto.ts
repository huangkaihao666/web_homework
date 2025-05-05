import { IsNotEmpty, IsNumber, IsArray, ValidateNested, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
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
  
  @IsOptional()
  productName?: string;
  
  @IsOptional()
  imgUrl?: string;
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
  recipientName?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  zipCode?: string;

  @IsOptional()
  paymentMethod?: string;

  @IsOptional()
  deliveryMethod?: string;

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