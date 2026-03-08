#!/bin/bash

# 测试框架验证脚本
# 用于验证 Vitest 和 Playwright 配置是否正确

echo "================================"
echo "AI-Dating 测试框架验证"
echo "================================"
echo ""

# 检查依赖是否安装
echo "1. 检查依赖..."
if [ ! -d "node_modules/vitest" ]; then
  echo "❌ Vitest 未安装"
  exit 1
fi

if [ ! -d "node_modules/@playwright/test" ]; then
  echo "❌ Playwright 未安装"
  exit 1
fi

echo "✅ 依赖已安装"
echo ""

# 运行单元测试
echo "2. 运行单元测试..."
npm run test:run
if [ $? -eq 0 ]; then
  echo "✅ 单元测试通过"
else
  echo "❌ 单元测试失败"
  exit 1
fi
echo ""

# 检查 Playwright 浏览器
echo "3. 检查 Playwright 浏览器..."
npx playwright install chromium
echo "✅ Playwright 浏览器已安装"
echo ""

# 运行 E2E 测试（需要开发服务器）
echo "4. E2E 测试准备就绪"
echo "   运行 'npm run test:e2e' 来执行 E2E 测试"
echo ""

echo "================================"
echo "✅ 测试框架配置验证完成"
echo "================================"
