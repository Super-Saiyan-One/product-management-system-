#!/bin/bash

SERVER_IP="192.144.128.67"

echo "======================================="
echo "    检查部署状态"
echo "    服务器IP: $SERVER_IP"
echo "======================================="

echo "等待服务启动..."

# 等待后端API
echo "检查后端API..."
for i in {1..30}; do
    if curl -f http://$SERVER_IP:3001/api/health &>/dev/null; then
        echo "✅ 后端API启动成功"
        break
    else
        echo "⏳ 等待后端启动... ($i/30)"
        sleep 10
    fi
done

# 等待前端
echo "检查前端服务..."
for i in {1..30}; do
    if curl -f http://$SERVER_IP &>/dev/null; then
        echo "✅ 前端服务启动成功"
        break
    else
        echo "⏳ 等待前端启动... ($i/30)"
        sleep 10
    fi
done

echo ""
echo "最终检查..."

# 最终状态检查
if curl -f http://$SERVER_IP:3001/api/health &>/dev/null; then
    echo "✅ 后端API: http://$SERVER_IP:3001/api/health"
else
    echo "❌ 后端API未响应"
fi

if curl -f http://$SERVER_IP &>/dev/null; then
    echo "✅ 前端网站: http://$SERVER_IP"
else
    echo "❌ 前端网站未响应"
fi

echo ""
echo "🎉 部署检查完成！"
echo ""
echo "📱 访问地址："
echo "   网站前端: http://$SERVER_IP"
echo "   API接口: http://$SERVER_IP:3001/api/health"
echo ""
echo "🔧 如果服务未启动，请检查："
echo "   1. 防火墙是否开放端口80和3001"
echo "   2. Docker服务是否正常运行"
echo "   3. 服务器日志: docker-compose -f /opt/product-management-system/docker-compose.ip.yml logs"
echo ""
echo "======================================="