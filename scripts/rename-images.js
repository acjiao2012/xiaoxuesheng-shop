const fs = require('fs');
const path = require('path');

// 定义重命名映射
const renameMap = {
  'banners': {
    'pexels-pixabay-207891.jpg': 'banner-main-promotion.jpg'
  },
  'categories': {
    'pexels-dina-adel-872032140-32772227.jpg': 'category-anime.jpg'
  },
  'products': {
    'pexels-couleur-32806698.jpg': 'product-1-panda.jpg',
    'pexels-pixabay-36039.jpg': 'product-2-sakura.jpg',
    'pexels-pixabay-272056.jpg': 'product-3-anime.jpg',
    'pexels-pixabay-459976.jpg': 'product-4-rabbit.jpg',
    'pexels-laryssa-suaid-798122-1667071.jpg': 'product-5-limited.jpg',
    'pexels-pixabay-4158.jpg': 'product-6-cat.jpg',
    'pexels-pixabay-248412.jpg': 'product-7-collectible.jpg',
    'pexels-suzyhazelwood-2533266.jpg': 'product-8-figure.jpg',
    'pexels-madebymath-90946.jpg': 'product-9-toy.jpg'
  },
  'placeholders': {
    'pexels-cottonbro-3661193.jpg': 'product-placeholder.jpg',
    'butterfly-9684516_1280.jpg': 'banner-placeholder.jpg',
    'butterfly-9684517_1280.jpg': 'avatar-placeholder.jpg'
  }
};

// 图标文件保持原样，因为它们已经是正确的命名格式
const iconFiles = [
  'icons8-hello-kitty-100.png',
  'icons8-woody-woodpecker-50.png',
  'icons8-bill-cipher-50.png',
  'icons8-genie-100.png',
  'icons8-rick-sanchez-50.png',
  'icons8-morty-smith-50.png',
  'icons8-brutus-50.png',
  'icons8-cheburashka-100.png',
  'icons8-mermaid-50.png',
  'icons8-morty-smith-100.png',
  'icons8-woody-woodpecker-100.png',
  'icons8-cheburashka-50.png',
  'icons8-mermaid-100.png',
  'icons8-bill-cipher-100.png',
  'icons8-brutus-100.png',
  'icons8-squidward-tentacles-50.png',
  'icons8-ninja-turtle-50.png',
  'icons8-rick-sanchez-100.png',
  'icons8-popeye-100.png',
  'icons8-ninja-turtle-100.png',
  'icons8-genie-50.png',
  'icons8-squidward-tentacles-100.png',
  'icons8-hello-kitty-50.png',
  'icons8-popeye-50.png'
];

function renameImages() {
  const imagesDir = path.join(__dirname, '..', 'public', 'images');
  
  console.log('开始重命名图片文件...\n');
  
  // 重命名各个目录中的文件
  Object.entries(renameMap).forEach(([dirName, fileMap]) => {
    const dirPath = path.join(imagesDir, dirName);
    
    if (!fs.existsSync(dirPath)) {
      console.log(`目录不存在: ${dirPath}`);
      return;
    }
    
    console.log(`处理目录: ${dirName}`);
    
    Object.entries(fileMap).forEach(([oldName, newName]) => {
      const oldPath = path.join(dirPath, oldName);
      const newPath = path.join(dirPath, newName);
      
      if (fs.existsSync(oldPath)) {
        try {
          fs.renameSync(oldPath, newPath);
          console.log(`  ✓ ${oldName} → ${newName}`);
        } catch (error) {
          console.error(`  ✗ 重命名失败: ${oldName}`, error.message);
        }
      } else {
        console.log(`  - 文件不存在: ${oldName}`);
      }
    });
  });
  
  // 检查图标文件
  const iconsDir = path.join(imagesDir, 'icons');
  if (fs.existsSync(iconsDir)) {
    console.log('\n检查图标文件...');
    const existingIcons = fs.readdirSync(iconsDir);
    
    iconFiles.forEach(iconName => {
      if (existingIcons.includes(iconName)) {
        console.log(`  ✓ ${iconName} (已存在)`);
      } else {
        console.log(`  - 缺少图标: ${iconName}`);
      }
    });
  }
  
  console.log('\n图片重命名完成！');
}

// 运行重命名脚本
renameImages(); 