# 图片资源补充需求

## 📋 已完成的更新

### 1. 订单页面 (Orders.vue)
- ✅ 更新了订单中的商品图片，使用 `imageUtils.getProductImage()` 函数
- ✅ 移除了硬编码的图片URL

### 2. 家长管理页面 (Parent.vue)
- ✅ 更新了孩子头像，使用 `DEFAULT_IMAGES.AVATAR` 占位图片
- ✅ 移除了硬编码的图片URL

### 3. 结算页面 (Checkout.vue)
- ✅ 更新了订单商品图片，使用 `imageUtils.getProductImage()` 函数
- ✅ 移除了硬编码的图片URL

## 🎯 还需要补充的图片资源

### 1. 头像图片 (Avatars)
**位置**: `public/images/avatars/`
**需求**: 为家长管理页面的孩子头像提供实际的图片

**建议文件**:
```
avatars/
├── child-1.jpg          # 男孩头像
├── child-2.jpg          # 女孩头像
├── child-3.jpg          # 男孩头像
├── child-4.jpg          # 女孩头像
└── default-avatar.jpg   # 默认头像
```

**规格建议**:
- 尺寸: 100x100px (正方形)
- 格式: JPG
- 风格: 可爱、卡通风格
- 背景: 简洁背景

### 2. 侧边Banner图片 (Side Banners)
**位置**: `public/images/banners/`
**需求**: 为主页侧边Banner提供实际图片

**建议文件**:
```
banners/
├── banner-main-promotion.jpg    # 已存在
├── banner-side-sale.jpg         # 需要添加 - 限时特惠
└── banner-side-new.jpg          # 需要添加 - 新品推荐
```

**规格建议**:
- 尺寸: 400x140px
- 格式: JPG
- 风格: 渐变背景 + 卡通元素
- 内容: 促销信息、新品推荐

### 3. 分类图标 (Category Icons)
**位置**: `public/images/categories/`
**需求**: 为其他分类提供实际的图标文件

**建议文件**:
```
categories/
├── category-anime.jpg           # 已存在
├── category-chibi.svg           # 需要添加 - Q版手办
├── category-hot.svg             # 需要添加 - 热门爆款
├── category-limited.svg         # 需要添加 - 限量礼盒
└── category-classic.svg         # 需要添加 - 经典收藏
```

**规格建议**:
- 尺寸: 64x64px
- 格式: SVG (矢量图)
- 风格: 扁平化设计，可爱风格
- 色彩: 与主题色彩保持一致

### 4. 功能图标 (Function Icons)
**位置**: `public/images/icons/`
**需求**: 为网站功能提供专门的图标

**建议文件**:
```
icons/
├── icon-cart.png                # 购物车图标
├── icon-user.png                # 用户图标
├── icon-search.png              # 搜索图标
├── icon-payment.png             # 支付图标
├── icon-shipping.png            # 物流图标
├── icon-service.png             # 客服图标
└── icon-security.png            # 安全图标
```

**规格建议**:
- 尺寸: 32x32px
- 格式: PNG (支持透明背景)
- 风格: 扁平化设计
- 色彩: 与主题色彩保持一致

### 5. 支付方式图标 (Payment Icons)
**位置**: `public/images/payment/`
**需求**: 为结算页面的支付方式提供图标

**建议文件**:
```
payment/
├── wechat-pay.png               # 微信支付
├── alipay.png                   # 支付宝
├── parent-pay.png               # 家长支付
└── union-pay.png                # 银联支付
```

**规格建议**:
- 尺寸: 48x48px
- 格式: PNG
- 风格: 官方Logo风格
- 背景: 透明背景

## 🛠️ 图片获取建议

### 1. 头像图片
- **来源**: Unsplash、Pexels 搜索 "child portrait"、"cute kid"
- **处理**: 裁剪为正方形，调整尺寸为100x100px
- **风格**: 选择可爱、阳光的儿童照片

### 2. Banner图片
- **来源**: Unsplash、Pexels 搜索 "toy"、"gift"、"cartoon"
- **处理**: 添加渐变背景和文字
- **工具**: 使用Canva或Figma设计

### 3. 分类图标
- **来源**: Flaticon、Icons8 搜索 "toy"、"cartoon"、"gift"
- **格式**: 下载SVG格式
- **处理**: 统一颜色风格

### 4. 功能图标
- **来源**: Element Plus图标库、Icons8
- **处理**: 保持与Element Plus风格一致

### 5. 支付图标
- **来源**: 各支付平台官方Logo
- **注意**: 确保使用官方授权的Logo

## 📝 实施计划

### 第一阶段：头像和Banner
1. 下载并处理头像图片
2. 设计侧边Banner图片
3. 更新家长管理页面使用实际头像

### 第二阶段：分类和功能图标
1. 下载分类图标
2. 下载功能图标
3. 更新分类页面使用实际图标

### 第三阶段：支付图标
1. 获取支付方式图标
2. 更新结算页面使用实际图标

## 🔧 代码更新

完成图片资源添加后，需要更新以下文件：

1. **imageUtils.ts**: 添加新的图片路径配置
2. **Parent.vue**: 使用实际头像图片
3. **Home.vue**: 使用实际Banner图片
4. **Checkout.vue**: 使用实际支付图标

## 📊 优先级

- **高优先级**: 头像图片、侧边Banner
- **中优先级**: 分类图标、功能图标
- **低优先级**: 支付图标

这些图片资源的添加将大大提升用户体验和网站的视觉效果！ 