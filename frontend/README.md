# 产品管理系统 - 前端

基于Vue 3 + Element Plus的现代化产品管理界面

## 技术栈

- **Vue 3** - 渐进式JavaScript框架
- **Element Plus** - Vue 3组件库
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Vite** - 构建工具
- **Axios** - HTTP客户端
- **XLSX** - Excel处理

## 功能特性

- 🎯 产品信息管理
- 🔍 实时搜索筛选
- 📊 Excel导入导出
- 📱 响应式设计
- 🎨 现代化UI界面

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

### 预览构建

```bash
npm run preview
```

## 项目结构

```
src/
├── components/          # 通用组件
│   ├── ProductForm.vue  # 产品表单
│   └── ExcelUpload.vue  # Excel上传
├── views/              # 页面组件
│   ├── ProductList.vue # 产品列表
│   ├── ProductEdit.vue # 产品编辑
│   └── UpdateHistory.vue # 修改记录
├── stores/             # 状态管理
│   └── product.js      # 产品状态
├── api/                # API调用
│   └── index.js        # API接口
├── router/             # 路由配置
│   └── index.js        # 路由定义
└── utils/              # 工具函数
```

## 环境配置

创建 `.env.local` 文件：

```bash
VITE_API_URL=http://localhost:3001
```

## 部署

### Docker部署

```bash
docker build -t product-frontend .
docker run -p 3000:80 product-frontend
```

### Nginx部署

1. 构建项目：`npm run build`
2. 将 `dist/` 目录内容复制到nginx根目录
3. 配置nginx反向代理到后端API

## 开发说明

### 代码规范

- 使用ESLint进行代码检查
- 组件命名使用PascalCase
- 变量命名使用camelCase

### 组件开发

- 优先使用Composition API
- 合理抽取可复用组件
- 保持组件单一职责

### API调用

所有API调用统一在 `src/api/index.js` 中定义，使用统一的错误处理。

## 浏览器支持

- Chrome >= 87
- Firefox >= 78  
- Safari >= 14
- Edge >= 88