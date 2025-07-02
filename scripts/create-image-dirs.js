import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 图片目录结构
const imageDirs = [
  'public/images',
  'public/images/products',
  'public/images/banners', 
  'public/images/categories',
  'public/images/icons',
  'public/images/placeholders'
]

// 创建目录
function createDirectories() {
  console.log('🖼️ 创建图片目录结构...')
  
  imageDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
      console.log(`✅ 创建目录: ${dir}`)
    } else {
      console.log(`📁 目录已存在: ${dir}`)
    }
  })
  
  console.log('\n📋 图片目录结构创建完成！')
  console.log('\n📁 目录结构:')
  console.log('public/')
  console.log('├── images/')
  console.log('│   ├── products/          # 商品图片')
  console.log('│   │   ├── product-1-panda.jpg')
  console.log('│   │   ├── product-2-sakura.jpg')
  console.log('│   │   ├── product-3-anime.jpg')
  console.log('│   │   ├── product-4-rabbit.jpg')
  console.log('│   │   ├── product-5-limited.jpg')
  console.log('│   │   └── product-6-cat.jpg')
  console.log('│   ├── banners/           # Banner图片')
  console.log('│   │   ├── banner-main-promotion.jpg')
  console.log('│   │   ├── banner-side-sale.jpg')
  console.log('│   │   └── banner-side-new.jpg')
  console.log('│   ├── categories/        # 分类图标')
  console.log('│   │   ├── category-anime.svg')
  console.log('│   │   ├── category-chibi.svg')
  console.log('│   │   ├── category-hot.svg')
  console.log('│   │   ├── category-limited.svg')
  console.log('│   │   └── category-classic.svg')
  console.log('│   ├── icons/             # 功能图标')
  console.log('│   │   ├── icon-cart.png')
  console.log('│   │   ├── icon-user.png')
  console.log('│   │   ├── icon-search.png')
  console.log('│   │   └── icon-payment.png')
  console.log('│   └── placeholders/      # 占位图片')
  console.log('│       ├── product-placeholder.jpg')
  console.log('│       ├── banner-placeholder.jpg')
  console.log('│       └── avatar-placeholder.jpg')
  console.log('\n🎯 请将下载的图片放入对应目录中！')
}

// 运行脚本
createDirectories() 