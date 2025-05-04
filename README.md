# 电商购物网站项目

本项目是一个基于Vue3和Nest.js的电商购物网站，包含前端商城、后台管理系统和后端API服务。

## 项目结构

```
- shopping-web/      # 前端商城（Vue3 + Vite + Element Plus）
- shopping-admin/    # 后台管理系统（Vue3 + Vite + Element Plus）
- shopping-server/   # 后端API服务（Nest.js）
```

## 功能特性

### 前端商城

- 首页展示：轮播图、商品分类、商品列表
- 商品详情：商品信息、规格参数、用户评价
- 购物车功能
- 下单结算
- 用户中心：订单管理、个人信息

### 后台管理系统

- 仪表盘：销售统计、订单概览
- 商品管理：商品列表、添加商品、编辑商品
- 订单管理：订单列表、订单详情、订单状态更新
- 用户管理：用户列表、用户详情
- 分类管理：分类列表、添加分类

### 后端API服务

- 用户认证：登录、注册
- 商品API：查询、创建、更新、删除
- 订单API：创建订单、更新订单状态、查询订单
- 用户API：用户信息管理
- 分类API：商品分类管理

## 技术栈

- 前端：Vue3、Vite、Element Plus、Vue Router
- 后端：Nest.js、TypeScript
- 数据存储：目前使用内存存储，可扩展为MongoDB或MySQL

## 安装与运行

### 前端商城

```bash
cd shopping-web
npm install
npm run dev
```

### 后台管理系统

```bash
cd shopping-admin
npm install
npm run dev
```

### 后端API服务

```bash
cd shopping-server
npm install
npm run start:dev
```

## 账号信息

### 前端商城
- 用户名：user1
- 密码：123456

### 后台管理系统
- 用户名：admin
- 密码：123456 