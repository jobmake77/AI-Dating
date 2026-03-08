/**
 * 性能测试脚本
 * 测试和对比优化前后的性能
 */

import { performance } from 'perf_hooks'

interface PerformanceTestResult {
  name: string
  duration: number
  memory?: {
    heapUsed: number
    heapTotal: number
  }
  timestamp: number
}

/**
 * 性能测试装饰器
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<{ result: T; metrics: PerformanceTestResult }> {
  const startTime = performance.now()
  const startMemory = process.memoryUsage()

  const result = await fn()

  const endTime = performance.now()
  const endMemory = process.memoryUsage()

  const metrics: PerformanceTestResult = {
    name,
    duration: endTime - startTime,
    memory: {
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
    },
    timestamp: Date.now(),
  }

  return { result, metrics }
}

/**
 * 批量性能测试
 */
export async function runPerformanceTests(
  tests: Array<{ name: string; fn: () => Promise<any> }>
): Promise<PerformanceTestResult[]> {
  const results: PerformanceTestResult[] = []

  for (const test of tests) {
    console.log(`Running test: ${test.name}`)
    const { metrics } = await measurePerformance(test.name, test.fn)
    results.push(metrics)
    console.log(`  Duration: ${metrics.duration.toFixed(2)}ms`)
    console.log(`  Memory: ${(metrics.memory!.heapUsed / 1024 / 1024).toFixed(2)}MB`)
  }

  return results
}

/**
 * 对比测试结果
 */
export function compareResults(
  before: PerformanceTestResult[],
  after: PerformanceTestResult[]
): {
  name: string
  improvement: {
    duration: number
    durationPercent: number
    memory: number
    memoryPercent: number
  }
}[] {
  const comparison = []

  for (let i = 0; i < before.length; i++) {
    const beforeResult = before[i]
    const afterResult = after[i]

    if (beforeResult.name !== afterResult.name) {
      console.warn(`Test name mismatch: ${beforeResult.name} vs ${afterResult.name}`)
      continue
    }

    const durationImprovement = beforeResult.duration - afterResult.duration
    const durationPercent = (durationImprovement / beforeResult.duration) * 100

    const memoryImprovement =
      (beforeResult.memory?.heapUsed || 0) - (afterResult.memory?.heapUsed || 0)
    const memoryPercent =
      ((memoryImprovement / (beforeResult.memory?.heapUsed || 1)) * 100)

    comparison.push({
      name: beforeResult.name,
      improvement: {
        duration: durationImprovement,
        durationPercent,
        memory: memoryImprovement,
        memoryPercent,
      },
    })
  }

  return comparison
}

/**
 * 生成性能报告
 */
export function generatePerformanceReport(
  comparison: ReturnType<typeof compareResults>
): string {
  let report = '# 性能优化对比报告\n\n'
  report += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`
  report += '## 测试结果\n\n'
  report += '| 测试项 | 时间改善 | 时间改善率 | 内存改善 | 内存改善率 |\n'
  report += '|--------|----------|------------|----------|------------|\n'

  comparison.forEach((item) => {
    const durationSign = item.improvement.duration > 0 ? '✅' : '❌'
    const memorySign = item.improvement.memory > 0 ? '✅' : '❌'

    report += `| ${item.name} | ${durationSign} ${item.improvement.duration.toFixed(2)}ms | ${item.improvement.durationPercent.toFixed(2)}% | ${memorySign} ${(item.improvement.memory / 1024 / 1024).toFixed(2)}MB | ${item.improvement.memoryPercent.toFixed(2)}% |\n`
  })

  report += '\n## 总结\n\n'

  const avgDurationImprovement =
    comparison.reduce((sum, item) => sum + item.improvement.durationPercent, 0) /
    comparison.length

  const avgMemoryImprovement =
    comparison.reduce((sum, item) => sum + item.improvement.memoryPercent, 0) /
    comparison.length

  report += `- 平均响应时间改善: ${avgDurationImprovement.toFixed(2)}%\n`
  report += `- 平均内存使用改善: ${avgMemoryImprovement.toFixed(2)}%\n`

  return report
}

/**
 * 保存性能报告
 */
export async function savePerformanceReport(
  report: string,
  filename: string = 'performance-report.md'
): Promise<void> {
  const fs = await import('fs/promises')
  const path = await import('path')

  const reportPath = path.join(process.cwd(), 'docs', filename)
  await fs.writeFile(reportPath, report, 'utf-8')

  console.log(`Performance report saved to: ${reportPath}`)
}

// 示例测试用例
export const exampleTests = [
  {
    name: '获取内容列表',
    fn: async () => {
      // 模拟数据库查询
      await new Promise((resolve) => setTimeout(resolve, 100))
      return { data: [] }
    },
  },
  {
    name: '搜索内容',
    fn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 150))
      return { data: [] }
    },
  },
  {
    name: '获取用户信息',
    fn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
      return { data: {} }
    },
  },
]

// 运行测试
if (require.main === module) {
  ;(async () => {
    console.log('Running performance tests...\n')

    const beforeResults = await runPerformanceTests(exampleTests)
    console.log('\n--- Optimization Applied ---\n')
    const afterResults = await runPerformanceTests(exampleTests)

    const comparison = compareResults(beforeResults, afterResults)
    const report = generatePerformanceReport(comparison)

    console.log('\n' + report)

    await savePerformanceReport(report)
  })()
}
