#!/bin/bash

# 使用Docker Hub镜像部署脚本
# 使用方法: ./deploy-docker.sh [server_ip] [backend_image] [frontend_image]

set -e

SERVER_IP=${1}
BACKEND_IMAGE=${2:-"your-dockerhub-username/product-management-backend:latest"}
FRONTEND_IMAGE=${3:-"your-dockerhub-username/product-management-frontend:latest"}

if [ -z "$SERVER_IP" ]; then
    echo "请提供服务器IP地址"
    echo "使用方法: ./deploy-docker.sh 192.168.1.100 [backend_image] [frontend_image]"
    exit 1
fi

echo "======================================="
echo "    使用Docker Hub镜像部署"
echo "    服务器IP: $SERVER_IP"
echo "    后端镜像: $BACKEND_IMAGE"
echo "    前端镜像: $FRONTEND_IMAGE"
echo "======================================="

# 设置环境变量
export SERVER_IP=$SERVER_IP
export BACKEND_IMAGE=$BACKEND_IMAGE
export FRONTEND_IMAGE=$FRONTEND_IMAGE
export MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-"SecureRootPass123!"}
export MYSQL_USER=${MYSQL_USER:-"app_user"}
export MYSQL_PASSWORD=${MYSQL_PASSWORD:-"SecureAppPass456!"}
export JWT_SECRET=${JWT_SECRET:-"jwt-secret-key-change-this-in-production"}

# 拉取最新镜像
echo "📥 拉取Docker镜像..."
docker pull $BACKEND_IMAGE
docker pull $FRONTEND_IMAGE
docker pull mysql:8.0

# 停止旧服务
echo "🔧 停止旧服务..."
docker-compose -f docker-compose.hub.yml down --remove-orphans || true

# 启动服务
echo "🚀 启动服务..."
docker-compose -f docker-compose.hub.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ 后端服务启动成功"
else
    echo "❌ 后端服务启动失败"
    docker-compose -f docker-compose.hub.yml logs backend
    exit 1
fi

if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ 前端服务启动成功"
else
    echo "❌ 前端服务启动失败"
    docker-compose -f docker-compose.hub.yml logs frontend
    exit 1
fi

echo ""
echo "🎉 部署完成！"
echo ""
echo "📱 访问地址:"
echo "   网站: http://$SERVER_IP"
echo "   API: http://$SERVER_IP:3001/api/health"
echo ""
echo "📊 管理命令:"
echo "   查看日志: docker-compose -f docker-compose.hub.yml logs -f"
echo "   重启服务: docker-compose -f docker-compose.hub.yml restart"
echo "   停止服务: docker-compose -f docker-compose.hub.yml down"
echo "======================================="