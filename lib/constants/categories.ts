export const CATEGORIES = {
  'source-code': {
    slug: 'source-code',
    name: '源码深潜',
    description: '深入剖析开源项目源码，理解架构设计与实现细节',
    icon: '🔍',
    color: 'blue',
  },
  'workshop': {
    slug: 'workshop',
    name: '实战工坊',
    description: '动手实践项目，从零到一构建真实应用',
    icon: '🛠️',
    color: 'green',
  },
  'architecture': {
    slug: 'architecture',
    name: '架构之道',
    description: '系统设计与架构模式，构建可扩展的软件系统',
    icon: '🏗️',
    color: 'purple',
  },
  'ai-frontier': {
    slug: 'ai-frontier',
    name: 'AI 前沿',
    description: '探索 AI 技术前沿，LLM、Agent、RAG 等最新实践',
    icon: '🤖',
    color: 'orange',
  },
  'interview': {
    slug: 'interview',
    name: '面试通关',
    description: '算法、系统设计、行为面试全方位准备',
    icon: '💼',
    color: 'red',
  },
} as const

export type CategorySlug = keyof typeof CATEGORIES

export const CATEGORY_OPTIONS = Object.values(CATEGORIES).map((cat) => ({
  value: cat.slug,
  label: cat.name,
}))
