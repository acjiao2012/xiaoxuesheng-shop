// 图片路径配置
export const IMAGE_PATHS = {
  // 商品图片
  PRODUCTS: {
    PANDA: '/images/products/product-1-panda.jpg',
    SAKURA: '/images/products/product-2-sakura.jpg',
    ANIME: '/images/products/product-3-anime.jpg',
    RABBIT: '/images/products/product-4-rabbit.jpg',
    LIMITED: '/images/products/product-5-limited.jpg',
    CAT: '/images/products/product-6-cat.jpg',
    COLLECTIBLE: '/images/products/product-7-collectible.jpg',
    FIGURE: '/images/products/product-8-figure.jpg',
    TOY: '/images/products/product-9-toy.jpg'
  },
  
  // Banner图片
  BANNERS: {
    MAIN_PROMOTION: '/images/banners/banner-main-promotion.jpg',
    SIDE_SALE: '/images/banners/b-dim-N5esX1ucwpA-unsplash.jpg',
    SIDE_NEW: '/images/banners/suzi-kim--flep8JQ2tg-unsplash.jpg'
  },
  
  // 分类图标
  CATEGORIES: {
    ANIME: '/images/categories/category-anime.jpg',
    CHIBI: '/images/categories/florian-cordier-E6R0Kn8TKQg-unsplash.jpg',
    HOT: '/images/categories/martin-woortman-N_deyFGJ27w-unsplash.jpg',
    LIMITED: '/images/categories/emma-ou-UnIaafi_AMQ-unsplash.jpg',
    CLASSIC: '/images/categories/busra-salkim-li4IZB_B52E-unsplash.jpg'
  },
  
  // 功能图标
  ICONS: {
    CART: '/images/icons/icons8-popeye-100.png',
    USER: '/images/icons/icons8-hello-kitty-100.png',
    SEARCH: '/images/icons/icons8-genie-100.png',
    PAYMENT: '/images/icons/icons8-brutus-100.png'
  },
  
  // 占位图片
  PLACEHOLDERS: {
    PRODUCT: '/images/placeholders/product-placeholder.jpg',
    BANNER: '/images/placeholders/banner-placeholder.jpg',
    AVATAR: '/images/placeholders/avatar-placeholder.jpg'
  }
}

// 图片工具函数
export const imageUtils = {
  // 获取商品图片
  getProductImage(productId: number): string {
    const productImages = {
      1: IMAGE_PATHS.PRODUCTS.PANDA,
      2: IMAGE_PATHS.PRODUCTS.SAKURA,
      3: IMAGE_PATHS.PRODUCTS.ANIME,
      4: IMAGE_PATHS.PRODUCTS.RABBIT,
      5: IMAGE_PATHS.PRODUCTS.LIMITED,
      6: IMAGE_PATHS.PRODUCTS.CAT,
      7: IMAGE_PATHS.PRODUCTS.COLLECTIBLE,
      8: IMAGE_PATHS.PRODUCTS.FIGURE,
      9: IMAGE_PATHS.PRODUCTS.TOY
    }
    
    return productImages[productId as keyof typeof productImages] || IMAGE_PATHS.PLACEHOLDERS.PRODUCT
  },

  // 获取Banner图片
  getBannerImage(type: 'main' | 'side-sale' | 'side-new'): string {
    const bannerImages = {
      main: IMAGE_PATHS.BANNERS.MAIN_PROMOTION,
      'side-sale': IMAGE_PATHS.BANNERS.SIDE_SALE,
      'side-new': IMAGE_PATHS.BANNERS.SIDE_NEW
    }
    
    return bannerImages[type] || IMAGE_PATHS.PLACEHOLDERS.BANNER
  },

  // 获取分类图标
  getCategoryIcon(categoryName: string): string {
    const categoryIcons = {
      '动漫角色': IMAGE_PATHS.CATEGORIES.ANIME,
      'Q版手办': IMAGE_PATHS.CATEGORIES.CHIBI,
      '热门爆款': IMAGE_PATHS.CATEGORIES.HOT,
      '限量礼盒': IMAGE_PATHS.CATEGORIES.LIMITED,
      '经典收藏': IMAGE_PATHS.CATEGORIES.CLASSIC
    }
    
    return categoryIcons[categoryName as keyof typeof categoryIcons] || IMAGE_PATHS.PLACEHOLDERS.PRODUCT
  },

  // 获取占位图片URL (在线服务)
  getPlaceholderImage(width: number = 300, height: number = 300, text: string = '手办图片'): string {
    return `https://via.placeholder.com/${width}x${height}/f0f9ff/7dd3fc?text=${encodeURIComponent(text)}`
  },

  // 获取渐变占位图片
  getGradientPlaceholder(width: number = 300, height: number = 300): string {
    return `https://via.placeholder.com/${width}x${height}/7dd3fc/f9a8d4?text=可爱手办`
  },

  // 获取卡通风格占位图片
  getCartoonPlaceholder(width: number = 300, height: number = 300): string {
    return `https://via.placeholder.com/${width}x${height}/86efac/fdba74?text=Q版手办`
  },

  // 手办商品占位图片
  getProductPlaceholder(productName: string): string {
    return `https://via.placeholder.com/300x300/f0f9ff/0ea5e9?text=${encodeURIComponent(productName)}`
  },

  // Banner占位图片
  getBannerPlaceholder(): string {
    return 'https://via.placeholder.com/800x300/7dd3fc/f9a8d4?text=新学期手办大促'
  },

  // 分类图标占位图片
  getCategoryPlaceholder(categoryName: string): string {
    return `https://via.placeholder.com/200x200/c4b5fd/8b5cf6?text=${encodeURIComponent(categoryName)}`
  }
}

// 图片加载优化
export const imageLoader = {
  // 预加载图片
  preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
      img.src = src
    })
  },

  // 批量预加载
  preloadImages(sources: string[]): Promise<void[]> {
    return Promise.all(sources.map(src => this.preloadImage(src)))
  },

  // 懒加载图片
  lazyLoadImage(element: HTMLImageElement, src: string, placeholder?: string) {
    if (placeholder) {
      element.src = placeholder
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          element.src = src
          observer.unobserve(element)
        }
      })
    })
    
    observer.observe(element)
  },

  // 预加载所有商品图片
  preloadProductImages(): Promise<void[]> {
    const productImages = Object.values(IMAGE_PATHS.PRODUCTS)
    return this.preloadImages(productImages)
  },

  // 预加载所有Banner图片
  preloadBannerImages(): Promise<void[]> {
    const bannerImages = Object.values(IMAGE_PATHS.BANNERS)
    return this.preloadImages(bannerImages)
  }
}

// 图片尺寸常量
export const IMAGE_SIZES = {
  PRODUCT_THUMBNAIL: { width: 300, height: 300 },
  PRODUCT_DETAIL: { width: 500, height: 500 },
  BANNER: { width: 800, height: 300 },
  CATEGORY: { width: 200, height: 200 },
  AVATAR: { width: 100, height: 100 }
}

// 默认图片配置
export const DEFAULT_IMAGES = {
  PRODUCT: IMAGE_PATHS.PLACEHOLDERS.PRODUCT,
  BANNER: IMAGE_PATHS.PLACEHOLDERS.BANNER,
  CATEGORY: IMAGE_PATHS.PLACEHOLDERS.PRODUCT,
  AVATAR: IMAGE_PATHS.PLACEHOLDERS.AVATAR,
  PLACEHOLDER: imageUtils.getPlaceholderImage()
} 