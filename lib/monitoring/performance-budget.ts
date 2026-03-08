/**
 * 性能预算配置
 * 定义各项性能指标的目标值
 */

export interface PerformanceBudget {
  // Web Vitals 指标
  webVitals: {
    // Largest Contentful Paint (最大内容绘制)
    LCP: number
    // First Input Delay (首次输入延迟)
    FID: number
    // Cumulative Layout Shift (累积布局偏移)
    CLS: number
    // First Contentful Paint (首次内容绘制)
    FCP: number
    // Time to First Byte (首字节时间)
    TTFB: number
    // Time to Interactive (可交互时间)
    TTI: number
  }

  // 资源大小预算
  resources: {
    // JavaScript 总大小 (KB)
    javascript: number
    // CSS 总大小 (KB)
    css: number
    // 图片总大小 (KB)
    images: number
    // 字体总大小 (KB)
    fonts: number
    // 总页面大小 (KB)
    total: number
  }

  // 请求数量预算
  requests: {
    // 总请求数
    total: number
    // JavaScript 请求数
    javascript: number
    // CSS 请求数
    css: number
    // 图片请求数
    images: number
  }

  // API 响应时间预算 (ms)
  api: Record<string, number>
}

/**
 * 默认性能预算
 * 基于 Web Vitals 的"良好"标准
 */
export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  webVitals: {
    LCP: 2500, // 2.5 秒
    FID: 100, // 100 毫秒
    CLS: 0.1, // 0.1
    FCP: 1800, // 1.8 秒
    TTFB: 600, // 600 毫秒
    TTI: 3800, // 3.8 秒
  },

  resources: {
    javascript: 300, // 300 KB
    css: 100, // 100 KB
    images: 1000, // 1 MB
    fonts: 100, // 100 KB
    total: 1500, // 1.5 MB
  },

  requests: {
    total: 50,
    javascript: 10,
    css: 5,
    images: 30,
  },

  api: {
    '/api/contents': 1000,
    '/api/users': 800,
    '/api/search': 1500,
    '/api/trending': 1000,
    '/api/recommendations': 2000,
    '/api/comments': 800,
    '/api/notifications': 1000,
  },
}

/**
 * 检查性能是否在预算内
 */
export function checkBudget(
  actual: number,
  budget: number,
  type: 'lower' | 'higher' = 'lower'
): {
  passed: boolean
  percentage: number
  difference: number
} {
  const difference = actual - budget
  const percentage = (actual / budget) * 100

  return {
    passed: type === 'lower' ? actual <= budget : actual >= budget,
    percentage,
    difference,
  }
}

/**
 * 生成性能预算报告
 */
export function generateBudgetReport(
  metrics: {
    webVitals?: Partial<PerformanceBudget['webVitals']>
    resources?: Partial<PerformanceBudget['resources']>
    requests?: Partial<PerformanceBudget['requests']>
    api?: Record<string, number>
  },
  budget: PerformanceBudget = DEFAULT_PERFORMANCE_BUDGET
) {
  const report: {
    webVitals: Record<string, ReturnType<typeof checkBudget>>
    resources: Record<string, ReturnType<typeof checkBudget>>
    requests: Record<string, ReturnType<typeof checkBudget>>
    api: Record<string, ReturnType<typeof checkBudget>>
    summary: {
      total: number
      passed: number
      failed: number
      passRate: number
    }
  } = {
    webVitals: {},
    resources: {},
    requests: {},
    api: {},
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      passRate: 0,
    },
  }

  // 检查 Web Vitals
  if (metrics.webVitals) {
    Object.entries(metrics.webVitals).forEach(([key, value]) => {
      if (value !== undefined) {
        const budgetValue = budget.webVitals[key as keyof typeof budget.webVitals]
        const result = checkBudget(value, budgetValue)
        report.webVitals[key] = result
        report.summary.total++
        if (result.passed) report.summary.passed++
        else report.summary.failed++
      }
    })
  }

  // 检查资源大小
  if (metrics.resources) {
    Object.entries(metrics.resources).forEach(([key, value]) => {
      if (value !== undefined) {
        const budgetValue = budget.resources[key as keyof typeof budget.resources]
        const result = checkBudget(value, budgetValue)
        report.resources[key] = result
        report.summary.total++
        if (result.passed) report.summary.passed++
        else report.summary.failed++
      }
    })
  }

  // 检查请求数量
  if (metrics.requests) {
    Object.entries(metrics.requests).forEach(([key, value]) => {
      if (value !== undefined) {
        const budgetValue = budget.requests[key as keyof typeof budget.requests]
        const result = checkBudget(value, budgetValue)
        report.requests[key] = result
        report.summary.total++
        if (result.passed) report.summary.passed++
        else report.summary.failed++
      }
    })
  }

  // 检查 API 响应时间
  if (metrics.api) {
    Object.entries(metrics.api).forEach(([endpoint, duration]) => {
      const budgetValue = budget.api[endpoint]
      if (budgetValue !== undefined) {
        const result = checkBudget(duration, budgetValue)
        report.api[endpoint] = result
        report.summary.total++
        if (result.passed) report.summary.passed++
        else report.summary.failed++
      }
    })
  }

  // 计算通过率
  report.summary.passRate =
    report.summary.total > 0 ? (report.summary.passed / report.summary.total) * 100 : 0

  return report
}

/**
 * 性能预算警告阈值
 */
export const BUDGET_WARNING_THRESHOLD = {
  // 超过预算的百分比
  warning: 90, // 90%
  critical: 110, // 110%
}

/**
 * 获取预算状态
 */
export function getBudgetStatus(percentage: number): 'good' | 'warning' | 'critical' {
  if (percentage <= BUDGET_WARNING_THRESHOLD.warning) return 'good'
  if (percentage <= BUDGET_WARNING_THRESHOLD.critical) return 'warning'
  return 'critical'
}
