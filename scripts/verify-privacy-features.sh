#!/bin/bash

# 隐私功能验证脚本
# 用于快速验证隐私合规功能是否正确部署

echo "=========================================="
echo "AI-Dating 隐私功能验证脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查文件是否存在
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2 (文件不存在: $1)"
        return 1
    fi
}

# 检查目录是否存在
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2 (目录不存在: $1)"
        return 1
    fi
}

echo "1. 检查组件文件..."
check_file "components/privacy/cookie-consent.tsx" "Cookie 同意组件"
check_file "components/privacy/privacy-settings-form.tsx" "隐私设置表单组件"
echo ""

echo "2. 检查页面文件..."
check_file "app/(main)/privacy/page.tsx" "隐私政策页面"
check_file "app/(main)/cookies/page.tsx" "Cookie 政策页面"
check_file "app/(main)/terms/page.tsx" "服务条款页面"
check_file "app/(main)/(dashboard)/settings/privacy/page.tsx" "隐私设置页面"
echo ""

echo "3. 检查 API 文件..."
check_file "lib/actions/privacy.ts" "隐私 API"
echo ""

echo "4. 检查数据库迁移..."
check_file "supabase/migrations/029_add_privacy_features.sql" "隐私功能迁移"
echo ""

echo "5. 检查文档..."
check_dir "docs/privacy" "隐私文档目录"
check_file "docs/privacy/README.md" "文档索引"
check_file "docs/privacy/privacy-implementation-report.md" "实现报告"
check_file "docs/privacy/gdpr-checklist.md" "GDPR 检查清单"
check_file "docs/privacy/privacy-compliance-guide.md" "合规指南"
check_file "docs/privacy/testing-guide.md" "测试指南"
check_file "docs/privacy/IMPLEMENTATION_SUMMARY.md" "实现总结"
echo ""

echo "6. 检查根布局集成..."
if grep -q "CookieConsent" app/layout.tsx; then
    echo -e "${GREEN}✓${NC} Cookie 同意组件已集成到根布局"
else
    echo -e "${RED}✗${NC} Cookie 同意组件未集成到根布局"
fi
echo ""

echo "=========================================="
echo "验证完成！"
echo "=========================================="
echo ""

echo "下一步操作："
echo "1. 运行数据库迁移: supabase db push"
echo "2. 启动开发服务器: npm run dev"
echo "3. 访问以下页面进行测试:"
echo "   - http://localhost:3000/privacy"
echo "   - http://localhost:3000/cookies"
echo "   - http://localhost:3000/terms"
echo "   - http://localhost:3000/settings/privacy"
echo ""
echo "4. 测试 Cookie 横幅:"
echo "   - 清除浏览器 localStorage"
echo "   - 刷新页面"
echo "   - 验证 Cookie 横幅显示"
echo ""
echo "详细测试步骤请参考: docs/privacy/testing-guide.md"
echo ""
