import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCommunityBySlug, getUserMembershipStatus } from '@/lib/queries/communities'
import { createCommunityPost } from '@/lib/actions/community-posts'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function CreatePostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: community } = await getCommunityBySlug(slug)
  if (!community) {
    redirect('/communities')
  }

  // 检查用户是否是社区成员
  const { data: membership } = await getUserMembershipStatus(community.id, user.id)
  if (!membership) {
    redirect(`/communities/${slug}`)
  }

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await createCommunityPost(community.id, formData)
    if (result.success && result.data) {
      redirect(`/communities/${slug}/posts/${result.data.id}`)
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <Link href={`/communities/${slug}`}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回社区
        </Button>
      </Link>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">发布帖子</h1>
        <p className="text-muted-foreground mb-6">
          在 <span className="font-medium">{community.name}</span> 社区发布新帖子
        </p>

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">标题 (可选)</Label>
            <Input
              id="title"
              name="title"
              placeholder="给你的帖子起个标题..."
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">内容 *</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="分享你的想法..."
              required
              minLength={1}
              maxLength={10000}
              rows={10}
            />
            <p className="text-sm text-muted-foreground">
              1-10000 个字符
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">图片 URL (可选，多个用逗号分隔)</Label>
            <Input
              id="images"
              name="images"
              placeholder="https://example.com/image1.png, https://example.com/image2.png"
            />
            <p className="text-sm text-muted-foreground">
              暂时需要手动输入图片 URL，后续会添加图片上传功能
            </p>
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              发布帖子
            </Button>
            <Link href={`/communities/${slug}`} className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                取消
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
