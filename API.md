# API文档

## 基础信息

- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT)

## 认证

### 用户注册

```http
POST /users/register
```

**请求体：**
```json
{
  "username": "testuser",
  "email": "test@example.com", 
  "password": "password123"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "user",
    "createdAt": "2023-12-01T10:00:00.000Z"
  },
  "message": "注册成功"
}
```

### 用户登录

```http
POST /users/login
```

**请求体：**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "登录成功"
}
```

## 产品管理

### 获取产品列表

```http
GET /products?page=1&size=20&name=商品&status=saleable&barcode=123&brand=品牌
```

**查询参数：**
- `page` - 页码（默认1）
- `size` - 每页数量（默认20）
- `name` - 商品名称（模糊搜索）
- `status` - 销售状态（saleable/non-saleable/to-be-removed）
- `barcode` - 条形码（模糊搜索）
- `brand` - 品牌（模糊搜索）

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "测试商品",
      "brand": "测试品牌",
      "barcode": "1234567890",
      "status": "saleable",
      "marketPrice": 100.00,
      "salePrice": 80.00,
      "purchasePrice": 60.00,
      "description": "商品描述",
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 20
}
```

### 获取产品详情

```http
GET /products/:id
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "测试商品",
    "brand": "测试品牌",
    "barcode": "1234567890",
    "status": "saleable",
    "marketPrice": 100.00,
    "salePrice": 80.00,
    "purchasePrice": 60.00,
    "description": "商品描述",
    "highlights": "商品亮点",
    "hasQualityCert": true,
    "warehouseCode": "WH001",
    "supplierCode": "SP001",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
}
```

### 创建产品

```http
POST /products
```

**请求体：**
```json
{
  "name": "新商品",
  "brand": "品牌名",
  "barcode": "9876543210",
  "status": "saleable",
  "marketPrice": 150.00,
  "salePrice": 120.00,
  "purchasePrice": 90.00,
  "description": "商品描述",
  "highlights": "商品亮点",
  "hasQualityCert": false,
  "warehouseCode": "WH002",
  "supplierCode": "SP002"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "新商品",
    "brand": "品牌名",
    "barcode": "9876543210",
    "status": "saleable",
    "marketPrice": 150.00,
    "salePrice": 120.00,
    "purchasePrice": 90.00,
    "createdAt": "2023-12-01T11:00:00.000Z",
    "updatedAt": "2023-12-01T11:00:00.000Z"
  }
}
```

### 更新产品

```http
PUT /products/:id
```

**请求体：**同创建产品

**响应：**同创建产品响应

### 删除产品

```http
DELETE /products/:id
```

**响应：**
```json
{
  "success": true,
  "message": "删除成功"
}
```

## Excel操作

### 导入产品

```http
POST /products/import
```

**请求体：**
```json
{
  "products": [
    {
      "name": "导入商品1",
      "brand": "品牌1",
      "barcode": "1111111111",
      "status": "saleable",
      "marketPrice": 100.00,
      "salePrice": 80.00,
      "purchasePrice": 60.00
    },
    {
      "name": "导入商品2",
      "brand": "品牌2", 
      "barcode": "2222222222",
      "status": "non-saleable",
      "marketPrice": 200.00,
      "salePrice": 160.00,
      "purchasePrice": 120.00
    }
  ]
}
```

**响应：**
```json
{
  "success": true,
  "successCount": 2,
  "failureCount": 0,
  "errors": []
}
```

### 导出产品

```http
GET /products/export?status=saleable
```

**查询参数：**
- `status` - 可选，指定导出的产品状态

**响应：**
返回Excel文件（application/vnd.openxmlformats-officedocument.spreadsheetml.sheet）

## 修改记录

### 获取产品修改记录

```http
GET /products/:id/records
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "productId": 1,
      "action": "update",
      "oldValues": "{\"name\":\"旧商品名\",\"price\":100}",
      "newValues": "{\"name\":\"新商品名\",\"price\":120}",
      "changes": "{\"name\":{\"old\":\"旧商品名\",\"new\":\"新商品名\"},\"price\":{\"old\":100,\"new\":120}}",
      "userId": 1,
      "createdAt": "2023-12-01T12:00:00.000Z",
      "product": {
        "name": "新商品名"
      },
      "user": {
        "username": "testuser"
      }
    }
  ]
}
```

## 文件上传

### 上传Excel文件

```http
POST /upload/excel
Content-Type: multipart/form-data
```

**表单数据：**
- `file` - Excel文件（.xlsx/.xls）

**响应：**
```json
{
  "success": true,
  "data": {
    "filename": "file-1234567890-123456789.xlsx",
    "originalName": "products.xlsx",
    "size": 15360,
    "path": "/uploads/file-1234567890-123456789.xlsx"
  },
  "message": "文件上传成功"
}
```

## 系统状态

### 健康检查

```http
GET /health
```

**响应：**
```json
{
  "status": "ok",
  "timestamp": "2023-12-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

## 错误响应

所有错误响应格式统一：

```json
{
  "success": false,
  "message": "错误描述"
}
```

**常见错误状态码：**
- `400` - 请求参数错误
- `401` - 未认证
- `403` - 权限不足
- `404` - 资源不存在
- `409` - 资源冲突（如条形码重复）
- `500` - 服务器内部错误

## 状态码说明

### 产品状态 (status)

- `saleable` - 可销售
- `non-saleable` - 不可销售
- `to-be-removed` - 需下架

### 操作类型 (action)

- `create` - 创建
- `update` - 更新  
- `delete` - 删除

## 请求示例

### cURL示例

```bash
# 登录获取token
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# 使用token获取产品列表
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 创建产品
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"测试商品","brand":"测试品牌","status":"saleable"}'
```

### JavaScript示例

```javascript
// 登录
const loginResponse = await fetch('/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    password: 'password123'
  })
})
const { data } = await loginResponse.json()
const token = data.token

// 获取产品列表
const productsResponse = await fetch('/api/products?page=1&size=10', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const products = await productsResponse.json()
```