'use client'

import { Component, ReactNode, type ErrorInfo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { logClientError } from '@/lib/utils/error-logger'
import { getFriendlyErrorMessage } from '@/lib/utils/error-handler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error?: Error
  errorCount: number
}

function getCopy() {
  const locale = typeof document !== 'undefined' ? document.documentElement.lang : 'zh'
  const isEnglish = locale?.startsWith('en')

  return {
    defaultMessage: isEnglish ? 'Something went wrong while loading the page' : '页面加载时出现了问题',
    title: isEnglish ? 'Something went wrong' : '出错了',
    retryHint: isEnglish
      ? 'Multiple retries failed. Please refresh the page or go back.'
      : '多次尝试失败，建议刷新页面或返回上一页',
    details: isEnglish ? 'View error details' : '查看错误详情',
    refresh: isEnglish ? 'Refresh page' : '刷新页面',
    retry: isEnglish ? 'Retry' : '重试',
    back: isEnglish ? 'Go back' : '返回上一页',
  }
}

/**
 * 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，显示友好的错误 UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorCount: 0 }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorCount: 0 }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误
    logClientError(error, {
      component: 'ErrorBoundary',
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    })

    // 调用自定义错误处理器
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    const newErrorCount = this.state.errorCount + 1

    // 如果错误次数过多，建议刷新页面
    if (newErrorCount >= 3) {
      window.location.reload()
      return
    }

    this.setState({
      hasError: false,
      error: undefined,
      errorCount: newErrorCount,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const friendlyMessage = this.state.error
        ? getFriendlyErrorMessage(this.state.error)
        : getCopy().defaultMessage

      const showDetails = this.props.showDetails ?? process.env.NODE_ENV === 'development'
      const copy = getCopy()

      return (
        <Card className="max-w-2xl mx-auto my-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              {copy.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {friendlyMessage}
            </p>
            {this.state.errorCount >= 2 && (
              <p className="text-sm text-amber-600">
                {copy.retryHint}
              </p>
            )}
            {showDetails && this.state.error && (
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  {copy.details}
                </summary>
                <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto text-xs">
                  {this.state.error.message}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
            <div className="flex gap-2">
              <Button onClick={this.handleReset} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                {this.state.errorCount >= 2 ? copy.refresh : copy.retry}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {copy.back}
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
