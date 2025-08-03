#!/bin/bash

# 产品管理系统IP部署脚本（无域名版本）
# 使用方法: ./deploy-ip.sh [server_ip]

set -e

SERVER_IP=${1}
APP_DIR="/opt/product-management-system"
BACKUP_DIR="/opt/backups/product-management"

if [ -z "$SERVER_IP" ]; then
    echo "请提供服务器IP地址"
    echo "使用方法: ./deploy-ip.sh 192.168.1.100"
    exit 1
fi

echo "======================================="
echo "    产品管理系统IP部署脚本"
echo "    服务器IP: $SERVER_IP"
echo "======================================="

# 检查是否为root用户
if [[ $EUID -eq 0 ]]; then
   echo "请不要使用root用户运行此脚本" 
   exit 1
fi

# 检查Docker环境
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

echo "✅ Docker环境检查通过"

# 创建应用目录
echo "📁 创建应用目录..."
sudo mkdir -p $APP_DIR
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p $APP_DIR/logs
sudo mkdir -p $APP_DIR/uploads
sudo mkdir -p $APP_DIR/mysql-backup

# 复制应用文件
echo "📋 复制应用文件..."
sudo cp -r ./* $APP_DIR/
sudo chown -R $USER:$USER $APP_DIR

# 切换到应用目录
cd $APP_DIR

# 更新前端API地址
echo "🔧 配置前端API地址..."
sed -i "s/YOUR_SERVER_IP/$SERVER_IP/g" frontend/.env.ip

# 检查环境变量文件
if [ ! -f .env.ip ]; then
    echo "❌ 缺少 .env.ip 文件"
    exit 1
fi

# 停止旧服务
echo "🔧 停止旧服务..."
docker-compose -f docker-compose.ip.yml down --remove-orphans || true

# 配置防火墙（开放必要端口）
echo "🔒 配置防火墙..."
if command -v ufw &> /dev/null; then
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 3001/tcp
    echo "防火墙配置完成"
fi

# 构建并启动服务
echo "🏗️  构建并启动服务..."
docker-compose -f docker-compose.ip.yml --env-file .env.ip up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ 后端服务启动成功"
else
    echo "❌ 后端服务启动失败"
    docker-compose -f docker-compose.ip.yml logs backend
    exit 1
fi

if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ 前端服务启动成功"
else
    echo "❌ 前端服务启动失败"
    docker-compose -f docker-compose.ip.yml logs frontend
    exit 1
fi

# 设置自动备份
echo "💾 配置自动备份..."
cat > /tmp/backup-script.sh << 'EOF'
#!/bin/bash
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/opt/backups/product-management/backup_$BACKUP_DATE.sql"

# 加载环境变量
source /opt/product-management-system/.env.ip

# 数据库备份
docker exec $(docker-compose -f /opt/product-management-system/docker-compose.ip.yml ps -q mysql) \
    mysqldump -u root -p$MYSQL_ROOT_PASSWORD product_management > $BACKUP_FILE

# 压缩备份文件
gzip $BACKUP_FILE

# 删除7天前的备份
find /opt/backups/product-management -name "*.sql.gz" -mtime +7 -delete

echo "数据库备份完成: $BACKUP_FILE.gz"
EOF

sudo mv /tmp/backup-script.sh /usr/local/bin/backup-product-management.sh
sudo chmod +x /usr/local/bin/backup-product-management.sh

# 添加到crontab（每天凌晨2点备份）
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-product-management.sh") | crontab -

# 配置日志轮转
sudo tee /etc/logrotate.d/product-management << EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 $USER $USER
    postrotate
        docker-compose -f $APP_DIR/docker-compose.ip.yml restart backend
    endscript
}
EOF

echo ""
echo "🎉 部署完成！"
echo ""
echo "📱 访问地址:"
echo "   网站: http://$SERVER_IP"
echo "   API: http://$SERVER_IP:3001/api/health"
echo ""
echo "📊 管理命令:"
echo "   查看日志: cd $APP_DIR && docker-compose -f docker-compose.ip.yml logs -f"
echo "   重启服务: cd $APP_DIR && docker-compose -f docker-compose.ip.yml restart"
echo "   停止服务: cd $APP_DIR && docker-compose -f docker-compose.ip.yml down"
echo "   数据备份: /usr/local/bin/backup-product-management.sh"
echo ""
echo "🔧 配置文件位置:"
echo "   应用目录: $APP_DIR"
echo "   备份目录: $BACKUP_DIR"
echo ""
echo "⚠️  重要提醒:"
echo "   1. 使用HTTP协议（无SSL加密）"
echo "   2. 请定期检查数据备份"
echo "   3. 请定期更新系统和Docker镜像"
echo "   4. 建议后续申请域名并配置HTTPS"
echo "======================================="