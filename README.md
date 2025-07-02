# 小学生手办商城

一个专为6-12岁小学生设计的手办电商平台，界面简洁、卡通明亮，支持家长管理和安全支付。

## 功能特性

### 用户功能
- 🏠 **首页展示** - 卡通风格的首页，展示热门商品和促销活动
- 🛍️ **商品浏览** - 分类浏览、搜索、商品详情查看
- 🛒 **购物车** - 添加商品、修改数量、清空购物车
- 📦 **订单管理** - 查看订单状态、订单历史
- 💳 **安全支付** - 支持微信支付、支付宝等多种支付方式

### 家长管理功能
- 👨‍👩‍👧‍👦 **孩子管理** - 添加孩子账号、设置消费限额
- 📊 **消费监控** - 查看孩子消费记录和消费趋势
- ✅ **订单审批** - 审批孩子的购物请求
- 🔒 **安全设置** - 设置支付密码、消费限制

### 技术特性
- 🎨 **响应式设计** - 支持桌面端和移动端
- 🚀 **性能优化** - 图片懒加载、组件懒加载
- 🛡️ **错误处理** - 完善的错误边界和错误提示
- 🔐 **安全防护** - 输入验证、XSS防护

## 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 快速的前端构建工具
- **Element Plus** - Vue 3组件库
- **Pinia** - Vue状态管理
- **Vue Router** - Vue官方路由
- **Axios** - HTTP客户端

### 后端（计划中）
- **Node.js** - JavaScript运行时
- **Express** - Web应用框架
- **MySQL/MongoDB** - 数据库
- **JWT** - 身份认证

## 项目结构

```
xiaoxuesheng-shop/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API接口
│   ├── components/        # 全局组件
│   ├── router/           # 路由配置
│   ├── store/            # 状态管理
│   ├── types/            # TypeScript类型定义
│   ├── utils/            # 工具函数
│   ├── views/            # 页面组件
│   ├── App.vue           # 根组件
│   ├── main.ts           # 入口文件
│   └── style.css         # 全局样式
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
├── vite.config.ts        # Vite配置
└── README.md             # 项目文档
```

## 安装和运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```

### 生产环境构建
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 环境配置

复制 `env.example` 文件为 `.env` 并配置相关环境变量：

```bash
cp env.example .env
```

### 配置说明
- `VITE_API_BASE_URL` - API服务器地址
- `VITE_APP_TITLE` - 应用标题
- `VITE_WECHAT_PAY_APP_ID` - 微信支付AppID
- `VITE_ALIPAY_APP_ID` - 支付宝AppID

## 开发指南

### 代码规范
- 使用TypeScript进行类型检查
- 遵循Vue 3 Composition API规范
- 使用ESLint进行代码检查
- 组件命名使用PascalCase
- 文件命名使用kebab-case

### 错误处理
项目已集成完善的错误处理机制：
- 全局错误边界
- API请求错误处理
- 表单验证错误处理
- 用户友好的错误提示

### 组件开发
- 使用 `<script setup>` 语法
- 定义Props和Emits类型
- 添加适当的注释
- 保持组件的单一职责

## 部署

### 构建生产版本
```bash
npm run build
```

### 部署到服务器
将 `dist` 目录下的文件部署到Web服务器即可。

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件至 [your-email@example.com]

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 完成基础功能开发
- 集成错误处理机制
- 添加响应式设计支持 