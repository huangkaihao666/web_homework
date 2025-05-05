import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { ProductsService } from '../products/products.service';

// 导出CartItem接口，使其可以被其他文件使用
export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  specs: Record<string, string>;
  selected: boolean;
}

@Injectable()
export class CartService {
  private cartItems: CartItem[] = [];
  private nextId = 1;

  constructor(private readonly productsService: ProductsService) {}

  getCartItems() {
    // 查询产品详情并返回
    return this.cartItems.map((item) => {
      const product = this.productsService.findOne(item.productId);
      return {
        ...item,
        product,
      };
    });
  }

  addToCart(createCartItemDto: CreateCartItemDto) {
    // 验证商品是否存在
    const product = this.productsService.findOne(createCartItemDto.productId);
    
    // 检查购物车中是否已有该商品
    const existingItem = this.cartItems.find(
      (item) => item.productId === createCartItemDto.productId &&
        JSON.stringify(item.specs || {}) === JSON.stringify(createCartItemDto.specs || {}),
    );
    
    if (existingItem) {
      // 如果已有该商品，更新数量
      const updatedItem = {
        ...existingItem,
        quantity: existingItem.quantity + createCartItemDto.quantity,
      };
      
      const index = this.cartItems.findIndex(
        (item) => item.id === existingItem.id,
      );
      this.cartItems[index] = updatedItem;
      
      return {
        ...updatedItem,
        product,
      };
    } else {
      // 添加新商品到购物车
      const newCartItem = {
        id: this.nextId++,
        productId: createCartItemDto.productId,
        quantity: createCartItemDto.quantity,
        specs: createCartItemDto.specs || {},
        selected: false,
      };
      
      this.cartItems.push(newCartItem);
      
      return {
        ...newCartItem,
        product,
      };
    }
  }

  updateCartItem(id: number, updateCartItemDto: UpdateCartItemDto) {
    const index = this.cartItems.findIndex((item) => item.id === id);
    
    if (index === -1) {
      throw new NotFoundException(`购物车商品 ID ${id} 未找到`);
    }
    
    const updatedItem = {
      ...this.cartItems[index],
      ...updateCartItemDto,
    };
    
    this.cartItems[index] = updatedItem;
    
    // 查询产品详情并返回
    const product = this.productsService.findOne(updatedItem.productId);
    
    return {
      ...updatedItem,
      product,
    };
  }

  removeFromCart(id: number) {
    const index = this.cartItems.findIndex((item) => item.id === id);
    
    if (index === -1) {
      throw new NotFoundException(`购物车商品 ID ${id} 未找到`);
    }
    
    const removedItem = this.cartItems[index];
    this.cartItems.splice(index, 1);
    
    return removedItem;
  }

  clearCart() {
    this.cartItems = [];
    return { success: true, message: '购物车已清空' };
  }
} 