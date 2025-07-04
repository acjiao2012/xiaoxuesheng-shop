# 小学生手办商城 - 后端API服务

## 📋 项目简介

这是小学生手办商城项目的后端API服务，基于Node.js + Express + SQLite构建，提供完整的电商功能API。

## 🚀 功能特性

### 用户系统
- ✅ 用户注册/登录
- ✅ JWT身份认证
- ✅ 用户信息管理
- ✅ 密码修改

### 商品管理
- ✅ 商品列表/详情
- ✅ 商品分类
- ✅ 商品搜索/筛选
- ✅ 热门商品推荐

### 购物车
- ✅ 添加/删除商品
- ✅ 数量修改
- ✅ 购物车统计
- ✅ 批量操作

### 订单系统
- ✅ 创建订单
- ✅ 订单状态管理
- ✅ 订单详情查询
- ✅ 订单取消/确认收货

### 用户中心
- ✅ 收货地址管理
- ✅ 优惠券管理
- ✅ 用户统计信息

## 🛠️ 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js
- **数据库**: SQLite3
- **认证**: JWT (JSON Web Token)
- **验证**: express-validator
- **加密**: bcryptjs
- **工具**: uuid, morgan, helmet, cors

## 📦 安装与运行

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 环境配置

复制环境变量示例文件：

```bash
cp env.example .env
```

根据需要修改 `.env` 文件中的配置。

### 3. 启动服务

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务将在 `http://localhost:3000` 启动。

## 📚 API文档

### 认证相关

#### 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456",
  "email": "test@example.com",
  "nickname": "测试用户"
}
```

#### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456"
}
```

#### 获取用户信息
```
GET /api/auth/me
Authorization: Bearer <token>
```

### 商品相关

#### 获取商品列表
```
GET /api/products?page=1&limit=12&category=xxx&search=xxx&sort=price_asc
```

#### 获取商品详情
```
GET /api/products/:id
```

#### 获取商品分类
```
GET /api/products/categories/list
```

#### 获取热门商品
```
GET /api/products/featured/list
```

### 购物车相关

#### 获取购物车
```
GET /api/cart
Authorization: Bearer <token>
```

#### 添加商品到购物车
```
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product-id",
  "quantity": 1
}
```

#### 更新购物车商品数量
```
PUT /api/cart/:itemId/quantity
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 2
}
```

#### 删除购物车商品
```
DELETE /api/cart/:itemId
Authorization: Bearer <token>
```

### 订单相关

#### 创建订单
```
POST /api/orders/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "product-id",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "name": "收货人",
    "phone": "13800138000",
    "address": "详细地址"
  },
  "remark": "备注信息",
  "couponId": "coupon-id"
}
```

#### 获取订单列表
```
GET /api/orders?page=1&limit=10&status=pending
Authorization: Bearer <token>
```

#### 获取订单详情
```
GET /api/orders/:orderId
Authorization: Bearer <token>
```

### 用户中心

#### 获取收货地址
```
GET /api/users/addresses
Authorization: Bearer <token>
```

#### 添加收货地址
```
POST /api/users/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "收货人",
  "phone": "13800138000",
  "province": "广东省",
  "city": "深圳市",
  "district": "南山区",
  "detailAddress": "详细地址",
  "isDefault": true
}
```

#### 获取用户优惠券
```
GET /api/users/coupons?status=unused
Authorization: Bearer <token>
```

## 🗄️ 数据库结构

### 主要数据表

- **users**: 用户表
- **categories**: 商品分类表
- **products**: 商品表
- **cart_items**: 购物车表
- **orders**: 订单表
- **order_items**: 订单详情表
- **addresses**: 收货地址表
- **coupons**: 优惠券表
- **user_coupons**: 用户优惠券表

## 🔧 开发指南

### 项目结构

```
backend/
├── src/
│   ├── app.js              # 应用入口
│   ├── database/
│   │   └── init.js         # 数据库初始化
│   └── routes/
│       ├── auth.js         # 认证路由
│       ├── products.js     # 商品路由
│       ├── cart.js         # 购物车路由
│       ├── orders.js       # 订单路由
│       └── users.js        # 用户路由
├── data/                   # 数据库文件
├── uploads/                # 上传文件
├── package.json
└── README.md
```

### 添加新功能

1. 在 `src/routes/` 目录下创建新的路由文件
2. 在 `src/app.js` 中注册新路由
3. 在 `src/database/init.js` 中添加必要的数据库表
4. 更新API文档

### 错误处理

所有API都遵循统一的错误响应格式：

```json
{
  "error": "错误描述",
  "details": "详细错误信息（可选）"
}
```

### 数据验证

使用 `express-validator` 进行输入验证，所有用户输入都会进行验证。

## 🚀 部署

### 生产环境配置

1. 设置 `NODE_ENV=production`
2. 修改 `JWT_SECRET` 为强密钥
3. 配置数据库备份
4. 设置日志记录
5. 配置反向代理（如Nginx）

### Docker部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 测试

运行测试：
```bash
npm test
```

## 🤝 贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

如有问题，请提交 Issue 或联系开发团队。 