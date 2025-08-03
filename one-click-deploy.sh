#!/bin/bash

# 一键部署脚本
SERVER_IP="192.144.128.67"

echo "======================================="
echo "    一键部署到服务器"
echo "    IP: $SERVER_IP"
echo "======================================="

# 检查项目打包文件是否存在
if [ ! -f "../product-management-system.tar.gz" ]; then
    echo "打包项目..."
    tar -czf ../product-management-system.tar.gz . 2>/dev/null
fi

echo "项目已打包完成"

# 创建部署脚本
cat > deploy_server.sh << 'EOF'
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
EOF

echo ""
echo "现在请按以下步骤操作："
echo ""
echo "1. 上传项目文件："
echo "   scp ../product-management-system.tar.gz root@192.144.128.67:/tmp/"
echo ""
echo "2. 上传部署脚本："
echo "   scp deploy_server.sh root@192.144.128.67:/tmp/"
echo ""
echo "3. 连接服务器并执行："
echo "   ssh root@192.144.128.67"
echo "   cd /tmp"
echo "   chmod +x deploy_server.sh"
echo "   ./deploy_server.sh"
echo ""
echo "密码: H|Crkz-%9K8f;/A"
echo ""
echo "或者，您可以复制以下完整命令："
echo ""
echo "# 在本机执行（需要手动输入密码）："
echo "scp ../product-management-system.tar.gz root@192.144.128.67:/tmp/ && scp deploy_server.sh root@192.144.128.67:/tmp/"
echo ""
echo "# 然后连接服务器执行："
echo "ssh root@192.144.128.67"
echo "# 在服务器上执行："
echo "cd /tmp && chmod +x deploy_server.sh && ./deploy_server.sh"
echo ""
echo "======================================="