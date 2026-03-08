# Redis 缓存快速配置指南

## 1. 注册 Upstash

1. 访问 https://console.upstash.com/
2. 使用 GitHub 或 Google 账号登录
3. 创建新的 Redis 数据库

## 2. 获取凭证

在 Upstash 控制台：
1. 选择你的数据库
2. 复制 `UPSTASH_REDIS_REST_URL`
3. 复制 `UPSTASH_REDIS_REST_TOKEN`

## 3. 配置环境变量

在 `.env.local` 中添加：
```bash
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

## 4. 安装依赖

```bash
npm install @upstash/redis
```

## 5. 测试连接

创建测试文件 `test-redis.ts`：
```typescript
import { getCacheStats } from './lib/cache/redis'

getCacheStats().then(stats => {
  console.log('Redis 连接状态:', stats)
})
```

运行测试：
```bash
npx tsx test-redis.ts
```

## 6. 使用缓存

### API 路由缓存
```typescript
import { withApiCache } from '@/lib/cache/middleware'

export const GET = withApiCache(async (req) => {
  const data = await fetchData()
  return NextResponse.json(data)
})
```

### 数据库查询缓存
```typescript
import { contentCache } from '@/lib/cache/query'

const { data, cached } = await contentCache.getContent(supabase, contentId)
console.log('从缓存获取:', cached)
```

### 自定义缓存
```typescript
import { withCache, CACHE_TTL } from '@/lib/cache/redis'

const data = await withCache(
  'my-cache-key',
  async () => {
    // 获取数据的逻辑
    return await fetchData()
  },
  CACHE_TTL.STATIC
)
```

## 7. 缓存失效

```typescript
import { cacheInvalidation } from '@/lib/cache/redis'

// 内容更新时
await cacheInvalidation.invalidateContent(contentId)

// 用户更新时
await cacheInvalidation.invalidateUser(userId)

// 清空所有缓存
await cacheInvalidation.invalidateAll()
```

## 8. 监控缓存

查看缓存统计：
```typescript
import { getCacheStats } from '@/lib/cache/redis'

const stats = await getCacheStats()
console.log(stats)
```

## 常见问题

### Q: 缓存没有生效？
A: 检查：
1. 环境变量是否正确配置
2. Redis 连接是否成功
3. 是否在服务端代码中使用（客户端不支持）

### Q: 如何调整缓存时间？
A: 修改 `lib/cache/redis.ts` 中的 `CACHE_TTL` 配置

### Q: 如何清空所有缓存？
A: 调用 `cacheInvalidation.invalidateAll()`

## 免费额度

Upstash 免费版：
- 10,000 命令/天
- 256 MB 存储
- 足够中小型项目使用

## 最佳实践

1. **合理设置 TTL**: 静态内容长，动态内容短
2. **及时失效**: 数据更新时立即失效缓存
3. **监控使用**: 定期检查缓存命中率
4. **避免大对象**: 不要缓存超过 1MB 的数据
