# 现代电商购物系统

<div align="center">
  <img src="https://img.shields.io/badge/Vue.js-3.x-42b883" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Nest.js-latest-ea2845" alt="Nest.js" />
  <img src="https://img.shields.io/badge/Element Plus-latest-409eff" alt="Element Plus" />
  <img src="https://img.shields.io/badge/Vite-latest-646cff" alt="Vite" />
</div>

## 📑 项目概述

本项目是一个基于Vue3和Nest.js开发的全栈电商系统，采用前后端分离架构，包含前端商城、后台管理系统和后端API服务。系统实现了完整的电商业务流程，包括商品浏览、购物车、下单支付、订单管理等核心功能。

项目特点：
- 📱 响应式设计，支持PC端和移动端
- 🛒 完整的电商业务流程实现
- 🔒 基于JWT的用户认证和授权
- 🖼️ 图片代理服务解决跨域问题
- 📊 数据可视化的后台管理界面

## 🔍 功能演示

### 前端商城

![商城首页](./screenshots/homepage.png)

用户可以浏览商品列表，查看商品详情，将商品添加到购物车，并完成下单和支付流程。系统实现了用户注册、登录、个人中心等功能，提供了完整的购物体验。

### 后台管理

![管理后台](./screenshots/admin-dashboard.png)

管理员可以通过后台系统管理商品、订单、用户和分类等数据，监控销售情况，处理订单状态，实现高效的电商运营管理。

## 🏗️ 项目结构

```
- shopping-web/      # 前端商城（Vue3 + Vite + Element Plus）
  |- src/            # 源代码
    |- api/          # API接口
    |- assets/       # 静态资源
    |- components/   # 公共组件
    |- router/       # 路由配置
    |- store/        # 状态管理
    |- utils/        # 工具函数
    |- views/        # 页面组件
  |- public/         # 公共资源
  |- vite.config.js  # Vite配置

- shopping-admin/    # 后台管理系统（Vue3 + Vite + Element Plus）
  |- src/            # 源代码
    |- api/          # API接口
    |- assets/       # 静态资源
    |- components/   # 公共组件
    |- router/       # 路由配置
    |- store/        # 状态管理
    |- utils/        # 工具函数
    |- views/        # 页面组件
  |- public/         # 公共资源
  |- vite.config.js  # Vite配置

- shopping-server/   # 后端API服务（Nest.js）
  |- src/            # 源代码
    |- controllers/  # 控制器
    |- services/     # 服务
    |- entities/     # 实体类
    |- middlewares/  # 中间件
    |- modules/      # 模块
  |- test/           # 测试文件
  |- nest-cli.json   # Nest配置
```

## 💡 核心功能

### 前端商城

- **首页展示**：轮播图、商品分类、商品列表、搜索功能
- **商品详情**：商品信息、规格参数、用户评价、相关推荐
- **购物车**：添加商品、修改数量、结算选中商品
- **下单结算**：收货地址管理、支付方式选择、订单提交
- **订单管理**：订单列表、订单详情、支付、取消订单
- **用户中心**：个人信息维护、收货地址管理、订单历史

### 后台管理系统

- **仪表盘**：销售统计、订单概览、用户增长趋势图表
- **商品管理**：商品列表、分类筛选、添加/编辑商品、上下架
- **订单管理**：订单列表、状态筛选、订单详情、状态更新
- **用户管理**：用户列表、用户详情、账号状态管理
- **分类管理**：分类列表、添加/编辑分类、分类排序

### 后端API服务

- **用户认证**：注册、登录、JWT验证、权限控制
- **商品API**：查询列表、详情获取、创建、更新、删除
- **订单API**：创建订单、支付、取消、发货、完成、查询
- **用户API**：用户信息、地址管理、权限验证
- **分类API**：分类增删改查、层级结构管理
- **图片代理**：解决前端跨域图片请求问题

## 🛠️ 技术栈

### 前端

- **框架**：Vue 3、Composition API
- **构建工具**：Vite
- **UI组件库**：Element Plus
- **路由**：Vue Router 4
- **状态管理**：Pinia / Vuex
- **HTTP客户端**：Axios
- **样式**：SCSS、CSS变量

### 后端

- **框架**：Nest.js
- **语言**：TypeScript
- **认证**：JWT
- **API文档**：Swagger
- **数据验证**：class-validator
- **日志**：Winston

### 数据存储

- 目前使用内存存储，可扩展为MongoDB或MySQL
- 支持本地存储(LocalStorage)缓存部分数据

## 📋 开发环境要求

- Node.js >= 14.x
- npm >= 6.x 或 yarn >= 1.22

## 🚀 安装与运行

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/ecommerce-system.git
cd ecommerce-system
```

### 2. 前端商城

```bash
cd shopping-web
npm install
npm run dev
```

访问：http://localhost:5173

### 3. 后台管理系统

```bash
cd shopping-admin
npm install
npm run dev
```

访问：http://localhost:5174

### 4. 后端API服务

```bash
cd shopping-server
npm install
npm run start:dev
```

API服务运行在：http://localhost:3000

## 🔧 生产环境部署

### 前端构建

```bash
# 商城前端
cd shopping-web
npm run build

# 管理系统
cd shopping-admin
npm run build
```

### 后端部署

```bash
cd shopping-server
npm run build
npm run start:prod
```

## 📝 开发指南

### 前端开发

1. **添加新页面**：
   - 在`views`目录创建页面组件
   - 在`router`中添加路由配置

2. **调用API**：
   - 在`api`目录添加相应接口方法
   - 使用`axios`发起请求

3. **状态管理**：
   - 使用Pinia/Vuex管理全局状态
   - 组件内使用Composition API管理局部状态

### 后端开发

1. **添加新功能**：
   - 创建控制器(Controller)
   - 实现服务(Service)
   - 定义实体(Entity)
   - 注册模块(Module)

2. **API文档**：
   - 使用Swagger注解记录API
   - 访问`/api`查看文档

## 👤 账号信息

### 前端商城
- 用户名：user1
- 密码：123456

### 后台管理系统
- 用户名：admin
- 密码：123456

## 📄 项目目录结构

```
ecommerce-system/
├── README.md                # 项目说明
├── shopping-web/            # 前端商城
├── shopping-admin/          # 后台管理系统 
├── shopping-server/         # 后端API服务
└── screenshots/             # 项目截图
```

## 🔄 开发流程

1. 用户注册/登录
2. 浏览商品列表/详情
3. 添加商品到购物车
4. 购物车管理
5. 提交订单
6. 支付订单
7. 查看订单状态
8. 管理员处理订单

## 📝 注意事项

- 本项目为教学演示用途，部分功能使用模拟数据
- 图片资源使用代理服务解决跨域问题
- 支付功能为模拟实现，无真实交易
- 内存数据在服务重启后会重置

## 🤝 贡献

欢迎贡献代码，提交问题和建议。请遵循项目的代码规范和提交信息格式。

## 📜 许可证

[MIT License](LICENSE) 