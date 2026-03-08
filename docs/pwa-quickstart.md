# PWA 快速配置指南

## 什么是 PWA？

Progressive Web App（渐进式 Web 应用）让网站具备类似原生应用的体验：
- ✅ 可安装到主屏幕
- ✅ 离线访问
- ✅ 推送通知
- ✅ 快速加载

## 快速配置

### 1. 文件已就绪

以下文件已创建：
- `/public/manifest.json` - PWA 清单
- `/public/sw.js` - Service Worker
- `/public/offline.html` - 离线页面
- `/lib/pwa/register.ts` - 注册工具

### 2. 注册 Service Worker

在 `app/layout.tsx` 中添加：

```typescript
'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/pwa/register'

export default function RootLayout({ children }) {
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 3. 创建图标

需要创建以下尺寸的图标（放在 `/public/icons/` 目录）：
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

可以使用工具生成：https://realfavicongenerator.net/

### 4. 测试 PWA

#### Chrome DevTools
1. 打开 DevTools (F12)
2. Application > Service Workers
3. 检查 Service Worker 状态

#### Lighthouse
```bash
npx lighthouse https://your-domain.com --view
```

检查 PWA 分数和建议。

### 5. 安装提示

添加安装按钮：

```typescript
'use client'

import { showPWAInstallPrompt } from '@/lib/pwa/register'
import { useEffect } from 'react'

export function InstallButton() {
  useEffect(() => {
    showPWAInstallPrompt()
  }, [])

  return (
    <button onClick={() => (window as any).installPWA()}>
      安装应用
    </button>
  )
}
```

## 缓存策略

### 静态资源（缓存优先）
- JavaScript/CSS 文件
- 图片/字体
- 图标

### API 请求（网络优先）
- 动态数据
- 用户信息
- 实时内容

### 页面（网络优先 + 离线回退）
- HTML 页面
- 失败时显示离线页面

## 推送通知（可选）

### 1. 生成 VAPID 密钥

```bash
npx web-push generate-vapid-keys
```

### 2. 配置环境变量

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

### 3. 请求通知权限

```typescript
import { requestNotificationPermission, subscribeToPushNotifications } from '@/lib/pwa/register'

async function enableNotifications() {
  const granted = await requestNotificationPermission()
  if (granted) {
    const subscription = await subscribeToPushNotifications()
    // 将 subscription 发送到服务器
  }
}
```

## 离线体验

### 自定义离线页面

编辑 `/public/offline.html` 自定义离线页面样式和内容。

### 离线数据同步

Service Worker 支持后台同步：

```typescript
// 在 sw.js 中
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})
```

## 更新策略

### 自动更新

Service Worker 会自动检查更新（每小时一次）。

### 手动更新

```typescript
import { unregisterServiceWorker, registerServiceWorker } from '@/lib/pwa/register'

async function forceUpdate() {
  await unregisterServiceWorker()
  await registerServiceWorker()
  window.location.reload()
}
```

## 测试清单

- [ ] Service Worker 注册成功
- [ ] manifest.json 可访问
- [ ] 图标显示正常
- [ ] 离线页面可访问
- [ ] 安装提示显示
- [ ] 离线模式工作正常
- [ ] Lighthouse PWA 分数 > 90

## 常见问题

### Q: Service Worker 没有注册？
A: 检查：
1. 是否在 HTTPS 环境（localhost 除外）
2. `/sw.js` 文件是否可访问
3. 浏览器是否支持 Service Worker

### Q: 离线模式不工作？
A: 检查：
1. Service Worker 是否激活
2. 缓存策略是否正确
3. 离线页面是否存在

### Q: 安装提示不显示？
A: 检查：
1. manifest.json 配置是否正确
2. 是否满足 PWA 安装条件
3. 用户是否已安装

## 浏览器支持

- ✅ Chrome/Edge (完全支持)
- ✅ Firefox (完全支持)
- ⚠️ Safari (部分支持，iOS 16.4+)
- ❌ IE (不支持)

## 最佳实践

1. **渐进增强**: PWA 功能应该是增强，不是必需
2. **快速加载**: 优化首次加载速度
3. **离线优先**: 关键功能应该离线可用
4. **及时更新**: 确保用户使用最新版本
5. **用户体验**: 提供清晰的安装和更新提示

## 参考资源

- [PWA 官方文档](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
