# OG 图片生成指南

## 📁 文件位置

已创建两个 HTML 生成器：
- `public/og-generator.html` - OG 图片生成器（1200x630px）
- `public/logo-generator.html` - Logo 生成器（512x512px）

## 🎨 设计特点

### ASCII 风格
- 使用 Courier New 等宽字体
- ASCII 艺术文字和装饰
- 复古科技感

### 动态颜色变换
- **渐变背景**: 紫色到粉色的渐变（#667eea → #764ba2 → #f093fb）
- **发光效果**: 文字带有动态发光动画
- **颜色循环**: ASCII 文字颜色在白色、金色、粉色、青色之间循环
- **粒子动画**: 背景有漂浮的粒子效果
- **网格动画**: 动态移动的网格背景

## 📸 截图步骤

### 方法 1: 浏览器截图（推荐）

1. **打开文件**
   ```bash
   # 在浏览器中打开
   open public/og-generator.html
   open public/logo-generator.html
   ```

2. **进入全屏模式**
   - Mac: `Cmd + Shift + F`
   - Windows/Linux: `F11`

3. **截图**
   - Mac: `Cmd + Shift + 4`，然后拖选区域
   - Windows: 使用 Snipping Tool
   - Linux: 使用 Screenshot 工具

4. **保存文件**
   - OG 图片: 保存为 `public/og-image.png` (1200x630px)
   - Logo: 保存为 `public/logo.png` (512x512px)

### 方法 2: 使用在线工具

访问以下网站上传 HTML 文件并导出为 PNG：
- https://html2canvas.hertzen.com/
- https://www.screenshotmachine.com/

### 方法 3: 使用命令行工具

如果安装了 Node.js，可以使用 Puppeteer：

```bash
# 安装 Puppeteer
npm install -g puppeteer

# 创建截图脚本
cat > screenshot.js << 'EOF'
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // OG 图片
  await page.setViewport({ width: 1200, height: 630 });
  await page.goto('file://' + __dirname + '/public/og-generator.html');
  await page.screenshot({ path: 'public/og-image.png' });

  // Logo
  await page.setViewport({ width: 512, height: 512 });
  await page.goto('file://' + __dirname + '/public/logo-generator.html');
  await page.screenshot({ path: 'public/logo.png' });

  await browser.close();
})();
EOF

# 运行脚本
node screenshot.js
```

## ✅ 验证

生成图片后，检查：

1. **文件大小**
   - OG 图片应该小于 1MB
   - Logo 应该小于 500KB

2. **尺寸**
   ```bash
   # 检查图片尺寸
   file public/og-image.png
   file public/logo.png
   ```

3. **预览效果**
   - 在浏览器中打开图片查看效果
   - 确保文字清晰可读
   - 颜色渐变正常

## 🔧 自定义

如果需要调整设计，可以编辑 HTML 文件：

### 修改颜色
```css
/* 在 og-generator.html 中找到 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);

/* 替换为你喜欢的颜色 */
background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 50%, #your-color-3 100%);
```

### 修改文字
```html
<!-- 在 HTML 中找到 -->
<div class="ascii-title">AI-Dating</div>
<div class="ascii-subtitle">A Date with AI</div>
<div class="ascii-tagline">连接 AI 开发者与创作者的技术社区</div>
```

### 调整动画速度
```css
/* 找到 animation 属性 */
animation: glow 3s ease-in-out infinite;

/* 修改秒数来调整速度 */
animation: glow 5s ease-in-out infinite; /* 更慢 */
```

## 📱 社交媒体预览

生成图片后，可以在这些工具中预览效果：
- https://www.opengraph.xyz/ - OG 图片预览
- https://cards-dev.twitter.com/validator - Twitter 卡片验证
- https://developers.facebook.com/tools/debug/ - Facebook 分享调试

## 🚀 部署后验证

部署网站后，使用以下工具验证 OG 图片：
```bash
# 检查 metadata
curl -I https://your-domain.com/og-image.png

# 应该返回 200 状态码
```

## 💡 提示

1. **截图时机**: 等待动画播放几秒后再截图，选择最佳视觉效果的时刻
2. **背景**: 如果需要透明背景，需要修改 CSS 中的 background 属性
3. **文件格式**: OG 图片推荐使用 PNG 格式以保持质量
4. **压缩**: 生成后可以使用 TinyPNG 等工具压缩图片大小

## 🎯 下一步

生成图片后：
1. 将 `og-image.png` 和 `logo.png` 放到 `public/` 目录
2. 重新构建项目: `npm run build`
3. 部署到生产环境
4. 使用社交媒体调试工具验证效果
