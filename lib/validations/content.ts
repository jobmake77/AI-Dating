import { z } from 'zod'

export const contentSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过 200 字符'),
  content: z.string().min(100, '内容至少需要 100 字符'),
  excerpt: z.string().max(500, '摘要不能超过 500 字符').optional(),
  price_type: z.enum(['free', 'member_only'], {
    message: '请选择价格类型',
  }),
  tags: z.string().min(1, '至少添加一个标签'),
})

export type ContentFormData = z.infer<typeof contentSchema>
