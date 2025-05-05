import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

// 统一的图片URL
const DEFAULT_IMAGE_URL = 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp';

@Injectable()
export class ProductsService {
  private products = [
    // 分类1：电子产品
    {
      id: 1,
      name: '智能手机',
      description: '高性能智能手机，拥有出色的拍照功能和超长电池续航',
      price: 3999,
      stock: 100,
      categoryId: 1,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 2,
      name: '笔记本电脑',
      description: '轻薄便携的笔记本电脑，搭载最新处理器',
      price: 5999,
      stock: 50,
      categoryId: 1,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 3,
      name: '智能手表',
      description: '全天候健康监测，支持多种运动模式',
      price: 1299,
      stock: 200,
      categoryId: 1,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 4,
      name: '无线耳机',
      description: '主动降噪，音质出众，舒适佩戴',
      price: 899,
      stock: 150,
      categoryId: 1,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 5,
      name: '平板电脑',
      description: '高清大屏，适合工作和娱乐',
      price: 2599,
      stock: 80,
      categoryId: 1,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 6,
      name: '智能音箱',
      description: '语音控制，智能家居中心',
      price: 399,
      stock: 120,
      categoryId: 1,
      imgUrl: DEFAULT_IMAGE_URL
    },
    
    // 分类2：服装
    {
      id: 7,
      name: '男士休闲夹克',
      description: '舒适面料，适合日常穿着',
      price: 299,
      stock: 200,
      categoryId: 2,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 8,
      name: '女士连衣裙',
      description: '优雅设计，适合多种场合',
      price: 359,
      stock: 150,
      categoryId: 2,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 9,
      name: '儿童套装',
      description: '舒适可爱，适合日常穿着',
      price: 199,
      stock: 180,
      categoryId: 2,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 10,
      name: '运动鞋',
      description: '轻便舒适，适合运动和日常穿着',
      price: 499,
      stock: 100,
      categoryId: 2,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 11,
      name: '牛仔裤',
      description: '经典款式，百搭耐穿',
      price: 239,
      stock: 220,
      categoryId: 2,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 12,
      name: '棉质T恤',
      description: '舒适透气，多色可选',
      price: 99,
      stock: 300,
      categoryId: 2,
      imgUrl: DEFAULT_IMAGE_URL
    },
    
    // 分类3：家居用品
    {
      id: 13,
      name: '智能床头灯',
      description: '可调光，支持智能控制',
      price: 159,
      stock: 100,
      categoryId: 3,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 14,
      name: '多功能锅具套装',
      description: '不粘涂层，适合多种烹饪方式',
      price: 599,
      stock: 80,
      categoryId: 3,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 15,
      name: '记忆棉枕头',
      description: '舒适支撑，助眠好帮手',
      price: 199,
      stock: 150,
      categoryId: 3,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 16,
      name: '智能扫地机器人',
      description: '自动清扫，节省时间',
      price: 1299,
      stock: 70,
      categoryId: 3,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 17,
      name: '多功能沙发床',
      description: '节省空间，两用家具',
      price: 2999,
      stock: 40,
      categoryId: 3,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 18,
      name: '厨房收纳组合',
      description: '整理厨房，美观实用',
      price: 399,
      stock: 120,
      categoryId: 3,
      imgUrl: DEFAULT_IMAGE_URL
    },
    
    // 分类4：书籍
    {
      id: 19,
      name: '经典文学全集',
      description: '世界名著合集，精装版',
      price: 499,
      stock: 60,
      categoryId: 4,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 20,
      name: '儿童绘本套装',
      description: '启发想象力，亲子共读',
      price: 299,
      stock: 100,
      categoryId: 4,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 21,
      name: '烹饪食谱大全',
      description: '从入门到精通，图文并茂',
      price: 159,
      stock: 80,
      categoryId: 4,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 22,
      name: '编程入门指南',
      description: '零基础学习编程的最佳指南',
      price: 89,
      stock: 120,
      categoryId: 4,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 23,
      name: '商业管理案例分析',
      description: '知名企业案例，管理者必读',
      price: 129,
      stock: 70,
      categoryId: 4,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 24,
      name: '心理学基础理论',
      description: '通俗易懂，生活应用',
      price: 99,
      stock: 90,
      categoryId: 4,
      imgUrl: DEFAULT_IMAGE_URL
    },
    
    // 分类5：运动户外
    {
      id: 25,
      name: '折叠自行车',
      description: '便携设计，城市通勤必备',
      price: 1599,
      stock: 40,
      categoryId: 5,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 26,
      name: '瑜伽垫',
      description: '环保材质，防滑设计',
      price: 129,
      stock: 100,
      categoryId: 5,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 27,
      name: '登山背包',
      description: '大容量，防水耐用',
      price: 359,
      stock: 60,
      categoryId: 5,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 28,
      name: '户外帐篷',
      description: '防风防雨，轻便易携',
      price: 599,
      stock: 50,
      categoryId: 5,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 29,
      name: '智能跑步腕表',
      description: '记录运动数据，科学健身',
      price: 899,
      stock: 70,
      categoryId: 5,
      imgUrl: DEFAULT_IMAGE_URL
    },
    {
      id: 30,
      name: '便携篮球',
      description: '标准尺寸，耐磨防滑',
      price: 159,
      stock: 80,
      categoryId: 5,
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