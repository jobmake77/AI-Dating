import { Search, Wrench, Building2, Bot, Briefcase } from 'lucide-react'

export const CATEGORIES = {
  'source-code': {
    name: '源码深潜',
    slug: 'source-code',
    description: '深入剖析开源项目源码，理解架构设计与实现细节',
    icon: Search,
    color: 'blue',
  },
  'workshop': {
    name: '实战工坊',
    slug: 'workshop',
    description: '动手实践项目，从零到一构建真实应用',
    icon: Wrench,
    color: 'green',
  },
  'architecture': {
    name: '架构之道',
    slug: 'architecture',
    description: '系统设计与架构模式，构建可扩展的软件系统',
    icon: Building2,
    color: 'purple',
  },
  'ai-frontier': {
    name: 'AI 前沿',
    slug: 'ai-frontier',
    description: '探索 AI 技术前沿，LLM、Agent、RAG 等实战应用',
    icon: Bot,
    color: 'orange',
  },
  'interview': {
    name: '面试通关',
    slug: 'interview',
    description: '算法、系统设计、行为面试全方位准备',
    icon: Briefcase,
    color: 'red',
  },
} as const

export type CategorySlug = keyof typeof CATEGORIES

export const CATEGORY_OPTIONS = Object.values(CATEGORIES).map((cat) => ({
  label: cat.name,
  value: cat.slug,
}))
