#!/bin/bash
set -e

# ============================================
# AI-Dating 数据库迁移脚本
# ============================================
# 用途: 按顺序执行所有数据库迁移文件
# 使用: ./migrate.sh [DATABASE_URL]
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 数据库连接字符串
if [ -z "$1" ]; then
  echo -e "${YELLOW}请提供数据库连接字符串:${NC}"
  echo "用法: ./migrate.sh 'postgresql://postgres:PASSWORD@db.elufwtaomearxmbsshad.supabase.co:5432/postgres'"
  exit 1
fi

DATABASE_URL="$1"

# 检查 psql 是否安装
if ! command -v psql &> /dev/null; then
  echo -e "${RED}❌ 错误: psql 未安装${NC}"
  echo "请安装 PostgreSQL 客户端:"
  echo "  macOS: brew install postgresql"
  echo "  Ubuntu: sudo apt-get install postgresql-client"
  exit 1
fi

# 测试数据库连接
echo -e "${BLUE}🔍 测试数据库连接...${NC}"
if ! psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo -e "${RED}❌ 数据库连接失败${NC}"
  exit 1
fi
echo -e "${GREEN}✅ 数据库连接成功${NC}"
echo ""

# 迁移文件列表 (按顺序)
MIGRATIONS=(
  "002_content_functions.sql"
  "003_refactor_tags_driven.sql"
  "004_add_missing_user_fields.sql"
  "005_fix_auth_and_rls.sql"
  "006_complete_database_refactor.sql"
  "007_create_comments_table.sql"
  "007b_approve_all_pending_content.sql"
  "008_create_likes_table.sql"
  "009_create_reposts_table.sql"
  "010_create_follows_table.sql"
  "011_create_notifications_table.sql"
  "012_enable_notifications_realtime.sql"
  "013_chat_system.sql"
  "014_fix_chat_rls.sql"
  "015_fix_chat_rls_complete.sql"
  "016_fix_conversations_rls.sql"
  "017_fix_messages_rls.sql"
  "018_create_communities_system.sql"
  "019_fix_community_members_rls.sql"
  "020_fix_rls_circular_dependency.sql"
  "021_simplify_rls_policies.sql"
  "022_create_events_system.sql"
  "023_admin_official_events.sql"
  "024_comments_reply.sql"
  "025_create_user_agents.sql"
  "026_create_analytics_events.sql"
  "027_create_user_onboarding.sql"
  "028_create_performance_monitoring.sql"
  "029_add_privacy_features.sql"
  "030_community_enhancements.sql"
  "031_data_archiving_system.sql"
  "032_database_monitoring.sql"
  "033_seed_example_contents.sql"
  "034_create_slow_query_logs.sql"
  "035_create_user_preferences.sql"
  "036_create_api_metrics.sql"
  "037_create_content_enhancement.sql"
  "038_database_optimization_indexes.sql"
  "039_add_follower_counts.sql"
  "040_database_cleanup.sql"
  "041_data_cleanup_cron.sql"
  "042_soft_delete_implementation.sql"
  "043_unify_price_types.sql"
  "044_add_missing_foreign_keys.sql"
)

# 统计
TOTAL=${#MIGRATIONS[@]}
SUCCESS=0
FAILED=0

echo -e "${BLUE}🚀 开始执行 ${TOTAL} 个迁移文件...${NC}"
echo ""

# 执行迁移
for migration in "${MIGRATIONS[@]}"; do
  file="supabase/migrations/$migration"

  if [ ! -f "$file" ]; then
    echo -e "${YELLOW}⚠️  跳过: $migration (文件不存在)${NC}"
    continue
  fi

  echo -e "${BLUE}📝 执行: $migration${NC}"

  if psql "$DATABASE_URL" -f "$file" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 成功${NC}"
    ((SUCCESS++))
  else
    echo -e "${RED}❌ 失败: $migration${NC}"
    echo -e "${YELLOW}尝试查看详细错误:${NC}"
    psql "$DATABASE_URL" -f "$file"
    ((FAILED++))

    # 询问是否继续
    echo ""
    read -p "是否继续执行剩余迁移? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${RED}迁移已中止${NC}"
      exit 1
    fi
  fi

  echo ""
done

# 总结
echo "================================"
echo -e "${BLUE}📊 迁移执行总结${NC}"
echo "================================"
echo -e "总计: ${TOTAL} 个迁移"
echo -e "${GREEN}成功: ${SUCCESS}${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}失败: ${FAILED}${NC}"
fi
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 所有迁移执行完成!${NC}"
  echo ""
  echo -e "${BLUE}下一步:${NC}"
  echo "1. 验证数据库结构"
  echo "2. 重新生成 TypeScript 类型:"
  echo "   npx supabase gen types typescript --project-id elufwtaomearxmbsshad > types/database.types.ts"
  echo "3. 测试应用功能"
else
  echo -e "${YELLOW}⚠️  部分迁移失败,请检查错误日志${NC}"
  exit 1
fi
