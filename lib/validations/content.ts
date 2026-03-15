import { z } from 'zod'

export const contentSchema = z.object({
  title: z.string().trim().max(200, '标题不能超过 200 字符').optional(),
  content: z.string().min(1, '内容不能为空').max(5000, '内容不能超过 5000 字符'),
  price_type: z.literal('free'),
  category: z.string().optional(),
})

export type ContentFormData = z.infer<typeof contentSchema>
