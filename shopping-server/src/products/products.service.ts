import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

// 统一的图片URL
const DEFAULT_IMAGE_URL = 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp';

@Injectable()
export class ProductsService {
  private products = [
    {
      id: 1,
      name: '商品1',
      description: '这是一个很好的商品',
      price: 299,
      stock: 100,
      categoryId: 1,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 2,
      name: '商品2',
      description: '这是第二个商品',
      price: 599,
      stock: 50,
      categoryId: 2,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 3,
      name: '商品3',
      description: '这是第三个商品',
      price: 99,
      stock: 200,
      categoryId: 3,
      imgUrl: DEFAULT_IMAGE_URL
    },
  ];

  findAll(categoryId: number | null) {
    if (categoryId) {
      return this.products.filter(product => product.categoryId === categoryId);
    }
    return this.products;
  }

  findOne(id: number) {
    const product = this.products.find(p => p.id === id);
    if (!product) {
      throw new NotFoundException(`商品ID ${id} 未找到`);
    }
    return product;
  }

  create(createProductDto: CreateProductDto) {
    const newId = Math.max(...this.products.map(p => p.id)) + 1;
    const newProduct = {
      id: newId,
      ...createProductDto,
      // 确保新产品使用默认图片URL
      imgUrl: DEFAULT_IMAGE_URL
    };
    this.products.push(newProduct);
    return newProduct;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`商品ID ${id} 未找到`);
    }
    
    this.products[index] = {
      ...this.products[index],
      ...updateProductDto,
      // 确保更新后的产品使用默认图片URL
      imgUrl: DEFAULT_IMAGE_URL
    };
    
    return this.products[index];
  }

  remove(id: number) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`商品ID ${id} 未找到`);
    }
    
    const deletedProduct = this.products[index];
    this.products.splice(index, 1);
    
    return deletedProduct;
  }
} 