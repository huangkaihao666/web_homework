import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { CartService, CartItem } from './cart.service';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCartItems() {
    return this.cartService.getCartItems();
  }

  @Post()
  addToCart(@Body() createCartItemDto: CreateCartItemDto) {
    return this.cartService.addToCart(createCartItemDto);
  }

  @Put(':id')
  updateCartItem(
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(+id, updateCartItemDto);
  }

  @Delete(':id')
  removeFromCart(@Param('id') id: string): CartItem {
    return this.cartService.removeFromCart(+id);
  }

  @Delete()
  clearCart() {
    return this.cartService.clearCart();
  }
} 