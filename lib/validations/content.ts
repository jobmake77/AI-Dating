import { z } from 'zod'

export const contentSchema = z.object({
  content: z.string().min(1, '内容不能为空').max(5000, '内容不能超过 5000 字符'),
  price_type: z.enum(['free', 'member']),
})

export type ContentFormData = z.infer<typeof contentSchema>
