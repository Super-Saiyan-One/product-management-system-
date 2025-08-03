#!/bin/bash

echo "======================================="
echo "     产品管理系统一键部署脚本"
echo "======================================="

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

echo "✅ Docker环境检查通过"

# 创建必要的目录
echo "📁 创建数据目录..."
mkdir -p data uploads

# 设置权限
chmod 755 data uploads

echo "🔧 停止并移除旧容器..."
docker-compose down --remove-orphans

echo "🏗️  构建并启动服务..."
docker-compose up --build -d

echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ 后端服务启动成功"
else
    echo "❌ 后端服务启动失败"
    docker-compose logs backend
    exit 1
fi

if curl -f http://localhost:3002 > /dev/null 2>&1; then
    echo "✅ 前端服务启动成功"
else
    echo "❌ 前端服务启动失败"
    docker-compose logs frontend
    exit 1
fi

echo ""
echo "🎉 部署完成！"
echo ""
echo "📱 访问地址:"
echo "   前端: http://localhost:3002"
echo "   后端API: http://localhost:3001"
echo "   健康检查: http://localhost:3001/api/health"
echo ""
echo "📊 查看日志: docker-compose logs -f"
echo "🛑 停止服务: docker-compose down"
echo "🔄 重启服务: docker-compose restart"
echo ""
echo "======================================="