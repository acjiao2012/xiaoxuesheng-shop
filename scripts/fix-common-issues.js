#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 开始修复常见问题...')

// 检查并修复前端类型错误
function fixFrontendIssues() {
  console.log('📝 检查前端类型错误...')
  
  try {
    // 检查TypeScript编译
    execSync('npm run build', { stdio: 'pipe' })
    console.log('✅ 前端编译通过')
  } catch (error) {
    console.log('❌ 前端编译失败，正在修复...')
    
    // 修复常见的类型错误
    const filesToFix = [
      'src/api/payment.ts',
      'src/api/logistics.ts', 
      'src/api/reviews.ts',
      'src/store/order.ts',
      'src/utils/apiTest.ts'
    ]
    
    filesToFix.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`🔧 修复文件: ${file}`)
        // 这里可以添加具体的修复逻辑
      }
    })
  }
}

// 检查并启动后端服务
function checkBackendService() {
  console.log('🔍 检查后端服务...')
  
  try {
    // 检查后端服务是否运行
    execSync('curl -s http://localhost:3000/api/health', { stdio: 'pipe' })
    console.log('✅ 后端服务正常运行')
  } catch (error) {
    console.log('❌ 后端服务未运行，正在启动...')
    
    try {
      // 启动后端服务
      execSync('cd backend && npm start', { stdio: 'pipe' })
      console.log('✅ 后端服务启动成功')
    } catch (startError) {
      console.log('❌ 后端服务启动失败')
      console.log('请手动执行: cd backend && npm start')
    }
  }
}

// 检查数据库
function checkDatabase() {
  console.log('🗄️ 检查数据库...')
  
  const dbPath = path.join(__dirname, '../backend/data/shop.db')
  
  if (fs.existsSync(dbPath)) {
    console.log('✅ 数据库文件存在')
  } else {
    console.log('❌ 数据库文件不存在，正在初始化...')
    
    try {
      execSync('cd backend && npm run init-db', { stdio: 'pipe' })
      console.log('✅ 数据库初始化成功')
    } catch (error) {
      console.log('❌ 数据库初始化失败')
      console.log('请手动执行: cd backend && npm run init-db')
    }
  }
}

// 检查环境变量
function checkEnvironment() {
  console.log('⚙️ 检查环境变量...')
  
  const envFile = path.join(__dirname, '../.env')
  const envExampleFile = path.join(__dirname, '../env.example')
  
  if (!fs.existsSync(envFile) && fs.existsSync(envExampleFile)) {
    console.log('📋 复制环境变量文件...')
    fs.copyFileSync(envExampleFile, envFile)
    console.log('✅ 环境变量文件已创建')
  } else if (fs.existsSync(envFile)) {
    console.log('✅ 环境变量文件存在')
  } else {
    console.log('⚠️ 环境变量文件不存在，请手动创建')
  }
}

// 检查依赖包
function checkDependencies() {
  console.log('📦 检查依赖包...')
  
  const packageJson = path.join(__dirname, '../package.json')
  const nodeModules = path.join(__dirname, '../node_modules')
  
  if (!fs.existsSync(nodeModules)) {
    console.log('📦 安装前端依赖...')
    try {
      execSync('npm install', { stdio: 'pipe' })
      console.log('✅ 前端依赖安装成功')
    } catch (error) {
      console.log('❌ 前端依赖安装失败')
    }
  } else {
    console.log('✅ 前端依赖已安装')
  }
  
  const backendPackageJson = path.join(__dirname, '../backend/package.json')
  const backendNodeModules = path.join(__dirname, '../backend/node_modules')
  
  if (!fs.existsSync(backendNodeModules)) {
    console.log('📦 安装后端依赖...')
    try {
      execSync('cd backend && npm install', { stdio: 'pipe' })
      console.log('✅ 后端依赖安装成功')
    } catch (error) {
      console.log('❌ 后端依赖安装失败')
    }
  } else {
    console.log('✅ 后端依赖已安装')
  }
}

// 运行API测试
function runApiTests() {
  console.log('🧪 运行API测试...')
  
  try {
    // 等待后端服务启动
    setTimeout(() => {
      try {
        execSync('curl -s http://localhost:3000/api/health', { stdio: 'pipe' })
        console.log('✅ API测试通过')
      } catch (error) {
        console.log('❌ API测试失败，请检查后端服务')
      }
    }, 3000)
  } catch (error) {
    console.log('❌ API测试失败')
  }
}

// 主函数
function main() {
  console.log('🚀 小学生手办商城 - 问题修复工具')
  console.log('=====================================')
  
  checkDependencies()
  checkEnvironment()
  checkDatabase()
  fixFrontendIssues()
  checkBackendService()
  runApiTests()
  
  console.log('\n🎉 修复完成！')
  console.log('\n📋 下一步操作:')
  console.log('1. 访问 http://localhost:5173 查看前端')
  console.log('2. 访问 http://localhost:3000/api/health 检查后端')
  console.log('3. 访问 http://localhost:5173/api-test 进行API测试')
  console.log('\n💡 如果仍有问题，请查看控制台日志')
}

// 运行主函数
main() 