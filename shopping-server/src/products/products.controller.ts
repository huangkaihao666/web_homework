import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('banners')
  getBanners() {
    return [
      { id: 1, imgUrl: 'https://images.pexels.com/photos/31930182/pexels-photo-31930182.jpeg?auto=compress&cs=tinysrgb&w=1200' },
      { id: 2, imgUrl: 'https://images.pexels.com/photos/28255125/pexels-photo-28255125/free-photo-of-c.jpeg?auto=compress&cs=tinysrgb&w=1200' },
      { id: 3, imgUrl: 'https://images.pexels.com/photos/2983398/pexels-photo-2983398.jpeg?auto=compress&cs=tinysrgb&w=1200' },
      { id: 4, imgUrl: 'https://images.pexels.com/photos/13094187/pexels-photo-13094187.jpeg?auto=compress&cs=tinysrgb&w=1200' }
    ];
  }

  @Get()
  findAll(@Query('category') categoryId: string) {
    return this.productsService.findAll(categoryId ? +categoryId : null);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
} 