#!/bin/bash
set -e

echo "开始在服务器上部署..."

# 解压项目
cd /tmp
if [ -f product-management-system.tar.gz ]; then
    tar -xzf product-management-system.tar.gz
    rm -rf /opt/product-management-system
    mkdir -p /opt
    mv product-management-system /opt/
    echo "项目解压完成"
else
    echo "错误：找不到项目文件"
    exit 1
fi

# 检查并安装Docker
if ! command -v docker &> /dev/null; then
    echo "安装Docker..."
    apt update
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    # 安装Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # 启动Docker
    systemctl enable docker
    systemctl start docker
    
    echo "Docker安装完成"
else
    echo "Docker已安装"
fi

# 验证Docker
docker --version
docker-compose --version

# 配置防火墙
if command -v ufw &> /dev/null; then
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 3001/tcp
    ufw --force enable
    echo "防火墙配置完成"
fi

# 进入项目目录
cd /opt/product-management-system

# 检查部署脚本
if [ ! -f deploy-ip.sh ]; then
    echo "错误：部署脚本不存在"
    exit 1
fi

# 给脚本执行权限
chmod +x deploy-ip.sh

# 部署应用
echo "开始部署应用..."
./deploy-ip.sh 192.144.128.67

echo ""
echo "🎉 部署完成！"
echo ""
echo "访问地址："
echo "  前端: http://192.144.128.67"
echo "  API:  http://192.144.128.67:3001/api/health"
echo ""
echo "管理命令："
echo "  查看状态: docker-compose -f docker-compose.ip.yml ps"
echo "  查看日志: docker-compose -f docker-compose.ip.yml logs -f"
echo "  重启服务: docker-compose -f docker-compose.ip.yml restart"
