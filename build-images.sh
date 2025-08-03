#!/bin/bash

# 构建Docker镜像并推送到Docker Hub脚本
# 使用方法: ./build-images.sh [version] [registry]

set -e

VERSION=${1:-"latest"}
REGISTRY=${2:-"your-dockerhub-username"}  # 替换为你的Docker Hub用户名
PROJECT_NAME="product-management"

echo "======================================="
echo "    构建产品管理系统Docker镜像"
echo "    版本: $VERSION"
echo "    仓库: $REGISTRY"
echo "======================================="

# 检查Docker环境
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装"
    exit 1
fi

echo "✅ Docker环境检查通过"

# 构建后端镜像
echo "🏗️  构建后端镜像..."
docker build -f Dockerfile.backend -t $REGISTRY/$PROJECT_NAME-backend:$VERSION .
docker build -f Dockerfile.backend -t $REGISTRY/$PROJECT_NAME-backend:latest .

# 构建前端镜像（IP版本）
echo "🏗️  构建前端镜像（IP版本）..."
docker build -f Dockerfile.frontend --build-arg BUILD_ENV=ip -t $REGISTRY/$PROJECT_NAME-frontend:$VERSION .
docker build -f Dockerfile.frontend --build-arg BUILD_ENV=ip -t $REGISTRY/$PROJECT_NAME-frontend:latest .

# 构建前端镜像（生产版本）
echo "🏗️  构建前端镜像（生产版本）..."
docker build -f Dockerfile.frontend --build-arg BUILD_ENV=production -t $REGISTRY/$PROJECT_NAME-frontend:$VERSION-prod .
docker build -f Dockerfile.frontend --build-arg BUILD_ENV=production -t $REGISTRY/$PROJECT_NAME-frontend:latest-prod .

echo "✅ 镜像构建完成"

# 显示构建的镜像
echo "📋 构建的镜像："
docker images | grep $REGISTRY/$PROJECT_NAME

echo ""
echo "🚀 推送镜像到Docker Hub（可选）："
echo "   docker push $REGISTRY/$PROJECT_NAME-backend:$VERSION"
echo "   docker push $REGISTRY/$PROJECT_NAME-backend:latest"
echo "   docker push $REGISTRY/$PROJECT_NAME-frontend:$VERSION"
echo "   docker push $REGISTRY/$PROJECT_NAME-frontend:latest"
echo "   docker push $REGISTRY/$PROJECT_NAME-frontend:$VERSION-prod"
echo "   docker push $REGISTRY/$PROJECT_NAME-frontend:latest-prod"

echo ""
echo "📝 使用镜像部署："
echo "   1. 修改 docker-compose.hub.yml 中的镜像名称"
echo "   2. 设置环境变量: export BACKEND_IMAGE=$REGISTRY/$PROJECT_NAME-backend:$VERSION"
echo "   3. 设置环境变量: export FRONTEND_IMAGE=$REGISTRY/$PROJECT_NAME-frontend:$VERSION"
echo "   4. 运行: docker-compose -f docker-compose.hub.yml up -d"

echo ""
echo "💡 快速推送脚本："
cat << EOF
# 推送所有镜像
docker push $REGISTRY/$PROJECT_NAME-backend:$VERSION
docker push $REGISTRY/$PROJECT_NAME-backend:latest
docker push $REGISTRY/$PROJECT_NAME-frontend:$VERSION
docker push $REGISTRY/$PROJECT_NAME-frontend:latest
docker push $REGISTRY/$PROJECT_NAME-frontend:$VERSION-prod
docker push $REGISTRY/$PROJECT_NAME-frontend:latest-prod

echo "🎉 所有镜像推送完成！"
EOF

echo "======================================="