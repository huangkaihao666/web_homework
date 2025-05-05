import { Controller, Get, Query, Res, HttpException, HttpStatus } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Response } from 'express';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('image')
  async proxyImage(@Query('url') imageUrl: string, @Res() res: Response) {
    if (!imageUrl) {
      throw new HttpException('URL参数不能为空', HttpStatus.BAD_REQUEST);
    }
    
    try {
      const { contentType, buffer } = await this.proxyService.fetchImage(imageUrl);
      
      // 设置响应头
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 缓存一天
      
      // 返回图片数据
      return res.send(buffer);
    } catch (error) {
      console.error('获取图片失败:', error);
      throw new HttpException('无法获取图片', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 