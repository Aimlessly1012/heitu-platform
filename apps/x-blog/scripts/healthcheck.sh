#!/bin/bash
# 服务健康检查脚本

URL="http://heitu.wang"
CONTAINER="x-blog"

echo "🏥 X-Blog 健康检查"
echo "===================="
echo ""

# 1. 检查容器状态
echo "📦 容器状态:"
if docker ps | grep -q "$CONTAINER"; then
  STATUS=$(docker inspect -f '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo "no healthcheck")
  UPTIME=$(docker inspect -f '{{.State.StartedAt}}' "$CONTAINER" | xargs date -d | awk '{print $1, $2, $3, $4, $5}')
  echo "   ✅ 容器运行中"
  echo "   ⏰ 启动时间: $UPTIME"
  echo "   🔍 健康状态: $STATUS"
else
  echo "   ❌ 容器未运行"
  exit 1
fi

echo ""

# 2. 检查 HTTP 响应
echo "🌐 HTTP 检查:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$URL")

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "   ✅ HTTP 状态: $HTTP_CODE"
  echo "   ⚡ 响应时间: ${RESPONSE_TIME}s"
else
  echo "   ❌ HTTP 状态: $HTTP_CODE"
  exit 1
fi

echo ""

# 3. 检查数据库
echo "💾 数据库检查:"
DB_SIZE=$(du -sh data/articles.db 2>/dev/null | cut -f1)
ARTICLE_COUNT=$(sqlite3 data/articles.db "SELECT COUNT(*) FROM articles;" 2>/dev/null)
USER_COUNT=$(sqlite3 data/articles.db "SELECT COUNT(*) FROM users;" 2>/dev/null)

if [ -n "$ARTICLE_COUNT" ]; then
  echo "   ✅ 数据库正常"
  echo "   📊 文章数量: $ARTICLE_COUNT"
  echo "   👥 用户数量: $USER_COUNT"
  echo "   💿 数据库大小: $DB_SIZE"
else
  echo "   ⚠️  数据库查询失败（需要 sqlite3）"
  echo "   💿 数据库大小: $DB_SIZE"
fi

echo ""

# 4. 检查资源使用
echo "⚙️  资源使用:"
STATS=$(docker stats "$CONTAINER" --no-stream --format "{{.CPUPerc}}\t{{.MemUsage}}")
CPU=$(echo "$STATS" | cut -f1)
MEM=$(echo "$STATS" | cut -f2)

echo "   🔥 CPU: $CPU"
echo "   💾 内存: $MEM"

echo ""

# 5. 检查最近错误
echo "📝 最近错误:"
ERROR_COUNT=$(docker logs "$CONTAINER" --since 1h 2>&1 | grep -c "Error")
if [ "$ERROR_COUNT" -eq 0 ] 2>/dev/null; then
  echo "   ✅ 最近 1 小时无错误"
else
  if [ -n "$ERROR_COUNT" ] && [ "$ERROR_COUNT" -gt 0 ]; then
    echo "   ⚠️  最近 1 小时检测到 $ERROR_COUNT 个错误"
    echo ""
    echo "   最新错误信息:"
    docker logs "$CONTAINER" --since 1h 2>&1 | grep "Error" | tail -3 | sed 's/^/   /'
  else
    echo "   ✅ 最近 1 小时无错误"
  fi
fi

echo ""
echo "✅ 健康检查完成"
