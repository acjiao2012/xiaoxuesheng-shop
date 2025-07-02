# 图片设置指南

## 📁 目录结构

项目使用以下目录结构来组织图片资源：

```
public/
├── images/
│   ├── products/          # 商品图片
│   │   ├── product-1-panda.jpg
│   │   ├── product-2-sakura.jpg
│   │   ├── product-3-anime.jpg
│   │   ├── product-4-rabbit.jpg
│   │   ├── product-5-limited.jpg
│   │   └── product-6-cat.jpg
│   ├── banners/           # Banner图片
│   │   ├── banner-main-promotion.jpg
│   │   ├── banner-side-sale.jpg
│   │   └── banner-side-new.jpg
│   ├── categories/        # 分类图标
│   │   ├── category-anime.svg
│   │   ├── category-chibi.svg
│   │   ├── category-hot.svg
│   │   ├── category-limited.svg
│   │   └── category-classic.svg
│   ├── icons/             # 功能图标
│   │   ├── icon-cart.png
│   │   ├── icon-user.png
│   │   ├── icon-search.png
│   │   └── icon-payment.png
│   └── placeholders/      # 占位图片
│       ├── product-placeholder.jpg
│       ├── banner-placeholder.jpg
│       └── avatar-placeholder.jpg
```

## 🚀 快速开始

### 1. 创建目录结构

运行以下命令自动创建图片目录：

```bash
npm run create-image-dirs
```

### 2. 下载并放置图片

从推荐的免费图片网站下载图片，并按照以下命名规则放置：

#### 商品图片 (products/)
- `product-1-panda.jpg` - Q版小熊猫手办
- `product-2-sakura.jpg` - 魔法少女小樱
- `product-3-anime.jpg` - 动漫主角限定
- `product-4-rabbit.jpg` - 超萌兔子手办
- `product-5-limited.jpg` - 限量礼盒装
- `product-6-cat.jpg` - 可爱猫咪手办

**建议规格**: 300x300px, JPG格式, 白色背景

#### Banner图片 (banners/)
- `banner-main-promotion.jpg` - 主Banner (新学期手办大促)
- `banner-side-sale.jpg` - 侧边Banner (限时特惠)
- `banner-side-new.jpg` - 侧边Banner (新品推荐)

**建议规格**: 
- 主Banner: 800x300px
- 侧边Banner: 400x140px

#### 分类图标 (categories/)
- `category-anime.svg` - 动漫角色
- `category-chibi.svg` - Q版手办
- `category-hot.svg` - 热门爆款
- `category-limited.svg` - 限量礼盒
- `category-classic.svg` - 经典收藏

**建议规格**: 64x64px, SVG格式

#### 功能图标 (icons/)
- `icon-cart.png` - 购物车图标
- `icon-user.png` - 用户图标
- `icon-search.png` - 搜索图标
- `icon-payment.png` - 支付图标

**建议规格**: 32x32px, PNG格式

#### 占位图片 (placeholders/)
- `product-placeholder.jpg` - 商品占位图
- `banner-placeholder.jpg` - Banner占位图
- `avatar-placeholder.jpg` - 头像占位图

## 🛠️ 代码使用

### 图片工具函数

```typescript
import { imageUtils, imageLoader } from '@/utils/imageUtils'

// 获取商品图片
const productImage = imageUtils.getProductImage(1, 'Q版小熊猫手办')

// 获取Banner图片
const bannerImage = imageUtils.getBannerImage('main')

// 获取分类图标
const categoryIcon = imageUtils.getCategoryIcon('动漫角色')

// 预加载图片
await imageLoader.preloadProductImages()
await imageLoader.preloadBannerImages()
```

### 在组件中使用

```vue
<template>
  <div class="product-card">
    <img 
      :src="imageUtils.getProductImage(product.id, product.title)" 
      :alt="product.title"
      @error="handleImageError"
    />
  </div>
</template>

<script setup>
import { imageUtils } from '@/utils/imageUtils'

function handleImageError(event) {
  event.target.src = '/images/placeholders/product-placeholder.jpg'
}
</script>
```

## 🎨 图片规范

### 商品图片规范
- **尺寸**: 300x300px (1:1比例)
- **格式**: JPG
- **背景**: 白色或浅色渐变
- **质量**: 高清，文件大小 < 200KB
- **风格**: 明亮、可爱、卡通风格

### Banner图片规范
- **主Banner**: 800x300px
- **侧边Banner**: 400x140px
- **格式**: JPG
- **风格**: 渐变背景 + 卡通元素
- **文字**: 清晰可读，避免复杂背景

### 图标规范
- **尺寸**: 64x64px (分类), 32x32px (功能)
- **格式**: SVG (分类), PNG (功能)
- **风格**: 扁平化设计，可爱风格
- **色彩**: 与主题色彩保持一致

## 🔧 图片优化

### 压缩图片
使用在线工具压缩图片以减小文件大小：
- **TinyPNG**: https://tinypng.com/
- **Squoosh**: https://squoosh.app/

### 格式选择
- **JPG**: 照片类图片，有损压缩
- **PNG**: 需要透明背景的图片
- **SVG**: 图标和矢量图形
- **WebP**: 现代浏览器支持，体积更小

### 响应式图片
对于重要图片，可以提供多个尺寸版本：

```html
<img 
  src="/images/products/product-1-panda.jpg"
  srcset="/images/products/product-1-panda-small.jpg 300w,
          /images/products/product-1-panda.jpg 600w"
  sizes="(max-width: 768px) 300px, 600px"
  alt="Q版小熊猫手办"
/>
```

## 🐛 故障排除

### 图片不显示
1. 检查文件路径是否正确
2. 确认文件名大小写匹配
3. 检查文件格式是否支持
4. 查看浏览器控制台错误信息

### 图片加载慢
1. 压缩图片文件大小
2. 使用WebP格式
3. 启用图片懒加载
4. 预加载重要图片

### 图片显示异常
1. 检查图片尺寸是否正确
2. 确认CSS样式设置
3. 验证图片文件完整性
4. 测试不同浏览器兼容性

## 📝 注意事项

1. **版权**: 确保使用免费商用图片
2. **备份**: 保存原始图片文件
3. **测试**: 在不同设备上测试显示效果
4. **性能**: 监控图片加载性能
5. **SEO**: 为图片添加合适的alt属性
6. **维护**: 定期检查和更新图片资源 