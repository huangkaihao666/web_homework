import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 配置全局前缀
  app.setGlobalPrefix('api');
  
  // 允许跨域
  app.enableCors();
  
  // 启用全局验证管道
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(process.env.PORT ?? 3000);
  
  console.log(`应用已启动: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
