import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  private categories = [
    { id: 1, name: '电子产品', icon: 'Monitor' },
    { id: 2, name: '手机', icon: 'Phone' },
    { id: 3, name: '服装', icon: 'ShoppingBag' },
    { id: 4, name: '食品', icon: 'Food' },
    { id: 5, name: '礼品', icon: 'Present' },
    { id: 6, name: '运动', icon: 'Soccer' }
  ];

  findAll() {
    return this.categories;
  }

  findOne(id: number) {
    const category = this.categories.find(c => c.id === id);
    if (!category) {
      throw new NotFoundException(`分类ID ${id} 未找到`);
    }
    return category;
  }

  create(createCategoryDto: CreateCategoryDto) {
    const newId = Math.max(...this.categories.map(c => c.id)) + 1;
    const newCategory = {
      id: newId,
      ...createCategoryDto,
      icon: createCategoryDto.icon || 'Question'
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new NotFoundException(`分类ID ${id} 未找到`);
    }
    
    this.categories[index] = {
      ...this.categories[index],
      ...updateCategoryDto
    };
    
    return this.categories[index];
  }

  remove(id: number) {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new NotFoundException(`分类ID ${id} 未找到`);
    }
    
    const deletedCategory = this.categories[index];
    this.categories.splice(index, 1);
    
    return deletedCategory;
  }
} 