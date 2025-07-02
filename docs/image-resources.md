# 图片资源指南

## 🖼️ 免费图片资源网站

### 1. **Unsplash** (https://unsplash.com)
- **特点**: 高质量摄影作品，免费商用
- **适合**: 背景图片、Banner图片、生活场景
- **搜索关键词**: 
  - `toy`, `figurine`, `collectible`
  - `cute`, `childhood`, `play`
  - `anime`, `manga`, `kawaii`

### 2. **Pexels** (https://pexels.com)
- **特点**: 免费商用，质量很高，包含视频
- **适合**: 商品展示、生活场景、背景图片
- **搜索关键词**:
  - `anime figure`, `collectible toy`
  - `cute character`, `kawaii`
  - `child toy`, `gift`

### 3. **Pixabay** (https://pixabay.com)
- **特点**: 免费商用，包含插画和照片
- **适合**: 各种类型的图片需求
- **搜索关键词**:
  - `chibi`, `manga character`
  - `cute toy`, `anime figure`
  - `kawaii`, `cartoon`

### 4. **Freepik** (https://freepik.com)
- **特点**: 矢量图和插画，需要注册，部分免费
- **适合**: 图标、插画、卡通形象
- **搜索关键词**:
  - `cute characters`, `anime style`
  - `kawaii`, `cartoon character`
  - `toy illustration`, `gift box`

### 5. **Flaticon** (https://flaticon.com)
- **特点**: 免费图标库，质量很高
- **适合**: 网站图标、功能图标、装饰元素
- **搜索关键词**:
  - `toy`, `gift`, `cartoon`
  - `cute`, `kawaii`, `anime`
  - `character`, `figure`

### 6. **Icons8** (https://icons8.com)
- **特点**: 免费图标和插画，多种风格
- **适合**: 界面图标、装饰元素
- **搜索关键词**:
  - `cute`, `kawaii`, `anime`
  - `toy`, `gift`, `character`
  - `cartoon`, `figure`

## 🎯 针对手办商城的图片建议

### 商品图片规范
- **尺寸**: 建议 1:1 (正方形) 或 4:3 比例
- **背景**: 白色或浅色渐变背景
- **角度**: 多角度展示 (正面、侧面、背面)
- **质量**: 高清图片，至少 800x800 像素
- **风格**: 明亮、可爱、卡通风格

### Banner图片规范
- **尺寸**: 建议 1200x400 或 1600x500
- **风格**: 渐变背景 + 卡通元素
- **色彩**: 使用项目主题色彩
- **文字**: 清晰可读，避免复杂背景

### 图标和装饰
- **风格**: 扁平化设计，可爱风格
- **色彩**: 与主题色彩保持一致
- **尺寸**: 统一尺寸，建议 64x64 或 128x128
- **格式**: SVG 格式优先，支持缩放

## 📱 图片优化建议

### 性能优化
1. **压缩图片**: 使用 TinyPNG 或 ImageOptim 压缩
2. **选择合适的格式**:
   - JPEG: 照片类图片
   - PNG: 需要透明背景的图片
   - WebP: 现代浏览器支持，体积更小
3. **响应式图片**: 提供多个尺寸版本
4. **懒加载**: 实现图片懒加载

### 用户体验
1. **占位图片**: 提供加载中的占位图片
2. **错误处理**: 图片加载失败时显示默认图片
3. **渐进式加载**: 先显示模糊版本，再加载高清版本
4. **预加载**: 重要图片提前加载

## 🛠️ 技术实现

### 图片工具函数
项目已提供 `src/utils/imageUtils.ts` 工具函数：
- 生成占位图片
- 图片预加载
- 懒加载实现
- 错误处理

### 优化图片组件
项目已提供 `src/components/OptimizedImage.vue` 组件：
- 自动懒加载
- 加载状态显示
- 错误处理
- 占位图片支持

## 📋 图片资源清单

### 需要准备的图片类型
1. **商品图片** (6-10张)
   - Q版小熊猫手办
   - 魔法少女小樱
   - 动漫主角限定
   - 超萌兔子手办
   - 限量礼盒装
   - 可爱猫咪手办

2. **Banner图片** (3-5张)
   - 主Banner (新学期手办大促)
   - 侧边Banner (限时特惠、新品推荐)

3. **分类图标** (5个)
   - 动漫角色
   - Q版手办
   - 热门爆款
   - 限量礼盒
   - 经典收藏

4. **功能图标** (10-15个)
   - 购物车、用户、搜索
   - 支付、物流、客服
   - 各种操作按钮图标

### 图片命名规范
```
商品图片: product-{id}-{name}.jpg
Banner图片: banner-{type}-{name}.jpg
分类图标: category-{name}.svg
功能图标: icon-{function}.svg
```

## 🔗 实用工具

### 图片处理工具
- **TinyPNG**: 在线图片压缩
- **Canva**: 在线设计工具
- **Figma**: 专业设计工具
- **GIMP**: 免费图片编辑软件

### 图片格式转换
- **Convertio**: 在线格式转换
- **CloudConvert**: 云端转换服务
- **ImageMagick**: 命令行工具

### 图片优化
- **ImageOptim**: Mac 图片优化
- **FileOptimizer**: Windows 图片优化
- **Squoosh**: Google 在线优化工具

## 📝 使用建议

1. **版权注意**: 确保使用免费商用图片
2. **质量优先**: 选择高质量图片，避免模糊
3. **风格统一**: 保持整体风格一致性
4. **尺寸规范**: 按照建议尺寸准备图片
5. **备份保存**: 保存原始图片文件
6. **测试验证**: 在不同设备上测试显示效果 