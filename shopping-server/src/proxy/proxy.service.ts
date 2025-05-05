import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ProxyService {
  async fetchImage(url: string): Promise<{ contentType: string; buffer: Buffer }> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 5000, // 5秒超时
        headers: {
          // 模拟浏览器请求，避免被拒绝
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://huaban.com/'
        }
      });

      const contentType = response.headers['content-type'] || 'image/jpeg';
      const buffer = Buffer.from(response.data, 'binary');

      return { contentType, buffer };
    } catch (error) {
      console.error('代理图片请求失败:', error);
      
      // 返回友好的错误信息
      if (axios.isAxiosError(error) && error.response) {
        throw new HttpException(
          `源服务器返回错误: ${error.response.status}`, 
          error.response.status
        );
      }
      
      throw new HttpException(
        '无法获取图片',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 