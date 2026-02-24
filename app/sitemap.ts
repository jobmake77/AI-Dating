import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const supabase = await createClient()

  // 获取所有已发布的内容
  const { data: contents } = await supabase
    .from('contents')
    .select('id, updated_at')
    .eq('status', 'approved')
    .order('updated_at', { ascending: false })

  // 获取所有用户
  const { data: users } = await supabase
    .from('users')
    .select('username, updated_at')
    .order('updated_at', { ascending: false })

  // 获取所有标签（从内容中提取）
  const { data: tagsData } = await supabase
    .from('contents')
    .select('tags')
    .eq('status', 'approved')
    .not('tags', 'is', null)

  // 提取唯一标签
  const tagsSet = new Set<string>()
  tagsData?.forEach((item) => {
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach((tag: string) => tagsSet.add(tag))
    }
  })

  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ]

  // 内容详情页
  const contentPages: MetadataRoute.Sitemap =
    contents?.map((content) => ({
      url: `${baseUrl}/post/${content.id}`,
      lastModified: new Date(content.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })) || []

  // 用户主页
  const userPages: MetadataRoute.Sitemap =
    users?.map((user) => ({
      url: `${baseUrl}/u/${user.username}`,
      lastModified: new Date(user.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })) || []

  // 标签页
  const tagPages: MetadataRoute.Sitemap = Array.from(tagsSet).map((tag) => ({
    url: `${baseUrl}/tag/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...contentPages, ...userPages, ...tagPages]
}
