#!/bin/bash
# 错误监控脚本

CONTAINER="x-blog"
TIME_WINDOW="1h"
ERROR_THRESHOLD=10

echo "🔍 X-Blog 错误监控"
echo "===================="
echo "⏰ 时间窗口: $TIME_WINDOW"
echo ""

# 统计错误类型
echo "📊 错误统计:"

# NextAuth 错误
NEXTAUTH_ERRORS=$(docker logs "$CONTAINER" --since "$TIME_WINDOW" 2>&1 | grep -c "\[next-auth\].*error" || echo "0")
echo "   🔐 NextAuth 错误: $NEXTAUTH_ERRORS"

# 数据库错误
DB_ERRORS=$(docker logs "$CONTAINER" --since "$TIME_WINDOW" 2>&1 | grep -ci "sqlite.*error\|database.*error" || echo "0")
echo "   💾 数据库错误: $DB_ERRORS"

# API 错误
API_ERRORS=$(docker logs "$CONTAINER" --since "$TIME_WINDOW" 2>&1 | grep -c "API.*[Ee]rror\|500" || echo "0")
echo "   🌐 API 错误: $API_ERRORS"

# 总错误数
TOTAL_ERRORS=$((NEXTAUTH_ERRORS + DB_ERRORS + API_ERRORS))
echo "   📈 总错误数: $TOTAL_ERRORS"

echo ""

# 告警判断
if [ "$TOTAL_ERRORS" -gt "$ERROR_THRESHOLD" ]; then
  echo "⚠️  告警: 检测到 $TOTAL_ERRORS 个错误（阈值: $ERROR_THRESHOLD）"
  echo ""
  echo "最近错误详情:"
  docker logs "$CONTAINER" --since "$TIME_WINDOW" 2>&1 | grep -i "error" | tail -5 | sed 's/^/  /'
  
  # 这里可以添加告警逻辑
  # 例如: 发送邮件、钉钉通知、企业微信等
  
  exit 1
else
  echo "✅ 正常: 错误数量在可接受范围内"
  exit 0
fi
