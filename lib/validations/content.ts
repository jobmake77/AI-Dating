import { z } from 'zod'

export const contentSchema = z.object({
  content: z.string().min(10, '内容至少需要 10 字符'),
  price_type: z.enum(['free', 'member_only']),
})

export type ContentFormData = z.infer<typeof contentSchema>
