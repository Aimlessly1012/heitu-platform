#!/bin/bash

# X-Blog Docker 管理脚本

case "$1" in
  start)
    echo "🚀 启动 X-Blog..."
    docker-compose up -d
    ;;
  stop)
    echo "🛑 停止 X-Blog..."
    docker-compose stop
    ;;
  restart)
    echo "🔄 重启 X-Blog..."
    docker-compose restart
    ;;
  logs)
    echo "📋 查看日志 (Ctrl+C 退出)..."
    docker-compose logs -f x-blog
    ;;
  status)
    echo "📊 容器状态："
    docker-compose ps
    echo ""
    echo "💾 资源使用："
    docker stats x-blog --no-stream
    ;;
  shell)
    echo "🐚 进入容器..."
    docker exec -it x-blog sh
    ;;
  rebuild)
    echo "🔨 重新构建并部署..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    ;;
  clean)
    echo "🧹 清理容器和镜像..."
    docker-compose down
    docker rmi x-blog-x-blog 2>/dev/null || true
    echo "✅ 清理完成"
    ;;
  update)
    echo "⬆️  更新部署..."
    git pull 2>/dev/null || echo "跳过 git pull"
    docker-compose down
    docker-compose build
    docker-compose up -d
    ;;
  *)
    echo "X-Blog Docker 管理工具"
    echo ""
    echo "用法: $0 {命令}"
    echo ""
    echo "命令："
    echo "  start     - 启动服务"
    echo "  stop      - 停止服务"
    echo "  restart   - 重启服务"
    echo "  logs      - 查看日志"
    echo "  status    - 查看状态"
    echo "  shell     - 进入容器"
    echo "  rebuild   - 重新构建"
    echo "  clean     - 清理容器"
    echo "  update    - 更新部署"
    echo ""
    echo "示例："
    echo "  $0 start"
    echo "  $0 logs"
    echo "  $0 status"
    ;;
esac
