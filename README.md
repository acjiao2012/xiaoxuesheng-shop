# 小学生手办商城

一个专为小学生设计的手办购物平台，支持家长监管的安全购物体验。

## 功能特性

### 🛒 购物功能
- 商品浏览和搜索
- 购物车管理
- 订单管理
- 优惠券系统

### 💳 支付功能
- 支付宝支付
- 微信支付
- 余额支付
- 支付状态跟踪

### 📦 物流功能
- 物流信息跟踪
- 实时状态更新
- 预计送达时间
- 物流轨迹显示

### ⭐ 评价功能
- 商品评分系统
- 文字评价
- 图片上传
- 标签选择
- 匿名评价

### 👨‍👩‍👧‍👦 用户系统
- 学生和家长账户
- 家长监管功能
- 安全设置
- 消息通知

## 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript
- **Element Plus** - Vue 3组件库
- **Vue Router** - 官方路由管理器
- **Pinia** - Vue状态管理
- **Vite** - 快速构建工具

### 后端
- **Node.js** - JavaScript运行时
- **Express** - Web应用框架
- **SQLite** - 轻量级数据库
- **JWT** - 身份认证

## 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend
npm install
```

### 环境配置
1. 复制环境变量文件：
```bash
cp env.example .env
```

2. 配置环境变量：
```env
# API配置
VITE_API_BASE_URL=http://localhost:3000/api

# 应用配置
VITE_APP_TITLE=小学生手办商城
VITE_APP_VERSION=1.0.0

# 支付配置
VITE_WECHAT_PAY_APP_ID=your_wechat_pay_app_id
VITE_ALIPAY_APP_ID=your_alipay_app_id

# 其他配置
VITE_ENABLE_DEBUG=true
```

### 启动后端服务
```bash
cd backend
npm start
```

后端服务将在 `http://localhost:3000` 启动

### 启动前端开发服务器
```bash
npm run dev
```

前端应用将在 `http://localhost:5173` 启动

### 构建生产版本
```bash
npm run build
```

## API接口

### 支付相关
- `POST /api/payment/create` - 创建支付订单
- `GET /api/payment/status/:id` - 查询支付状态
- `GET /api/users/balance` - 获取用户余额
- `POST /api/payment/refund` - 申请退款

### 物流相关
- `GET /api/logistics/tracking/:orderId` - 获取物流信息
- `GET /api/logistics/companies` - 获取物流公司列表
- `POST /api/logistics/ship` - 发货
- `POST /api/logistics/update-status` - 更新物流状态

### 评价相关
- `POST /api/reviews` - 提交评价
- `GET /api/reviews/product/:productId` - 获取商品评价列表
- `GET /api/reviews/user` - 获取用户评价列表
- `DELETE /api/reviews/:id` - 删除评价
- `PUT /api/reviews/:id` - 更新评价
- `GET /api/reviews/stats/:productId` - 获取评价统计

## 项目结构

```
xiaoxuesheng-shop/
├── src/
│   ├── api/              # API服务
│   │   ├── client.ts     # API客户端
│   │   ├── payment.ts    # 支付API
│   │   ├── logistics.ts  # 物流API
│   │   └── reviews.ts    # 评价API
│   ├── components/       # 公共组件
│   ├── router/           # 路由配置
│   ├── store/            # 状态管理
│   ├── types/            # 类型定义
│   ├── utils/            # 工具函数
│   └── views/            # 页面组件
│       ├── Payment.vue           # 支付页面
│       ├── Logistics.vue         # 物流页面
│       ├── Review.vue            # 评价页面
│       └── ProductReviews.vue    # 评价列表页面
├── backend/              # 后端服务
├── public/               # 静态资源
└── docs/                 # 文档
```

## 开发指南

### 代码规范
- 使用TypeScript进行类型检查
- 遵循Vue 3 Composition API规范
- 使用Element Plus组件库
- 统一的错误处理机制

### 调试工具
- Vue DevTools
- 浏览器开发者工具
- API连接测试工具

### 测试
```bash
# 运行API连接测试
npm run test:api

# 运行单元测试
npm run test:unit

# 运行E2E测试
npm run test:e2e
```

## 部署

### 前端部署
```bash
# 构建生产版本
npm run build

# 部署到服务器
# 将dist目录内容部署到Web服务器
```

### 后端部署
```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start backend/src/app.js

# 设置开机自启
pm2 startup
pm2 save
```

## 常见问题

### Q: 无法连接到后端API？
A: 检查后端服务是否启动，确认API_BASE_URL配置正确。

### Q: 支付功能无法使用？
A: 确认支付配置正确，检查支付宝和微信支付的应用ID。

### Q: 图片无法显示？
A: 检查图片路径是否正确，确认public目录下的图片文件存在。

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交Issue或联系开发团队。 