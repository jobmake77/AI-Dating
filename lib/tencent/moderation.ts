/**
 * 腾讯云天御内容安全 API 集成
 * 文档：https://cloud.tencent.com/document/product/1124
 */

import * as tencentcloud from 'tencentcloud-sdk-nodejs-tms'

const TmsClient = tencentcloud.tms.v20201229.Client

interface ModerationResult {
  isSafe: boolean
  suggestion: 'Pass' | 'Review' | 'Block'
  label: string
  score: number
  keywords?: string[]
  detail?: string
}

/**
 * 检测文本内容是否违规
 * @param content 要检测的文本内容
 * @returns 检测结果
 */
export async function moderateText(content: string): Promise<ModerationResult> {
  // 检查环境变量
  const secretId = process.env.TENCENT_SECRET_ID
  const secretKey = process.env.TENCENT_SECRET_KEY

  if (!secretId || !secretKey) {
    console.warn('腾讯云密钥未配置，跳过内容审核')
    return {
      isSafe: true,
      suggestion: 'Pass',
      label: '',
      score: 0,
    }
  }

  try {
    // 初始化客户端
    const client = new TmsClient({
      credential: {
        secretId,
        secretKey,
      },
      region: 'ap-guangzhou', // 广州地域
      profile: {
        httpProfile: {
          endpoint: 'tms.tencentcloudapi.com',
        },
      },
    })

    // 构造请求参数
    const params = {
      Content: Buffer.from(content).toString('base64'), // 文本内容需要 base64 编码
      DataId: `content_${Date.now()}`, // 数据标识
      User: {
        UserId: 'system',
        Nickname: 'system',
      },
    }

    // 调用 API
    const response = await client.TextModeration(params)

    // 解析结果
    const suggestion: 'Pass' | 'Review' | 'Block' = (response.Suggestion || 'Pass') as 'Pass' | 'Review' | 'Block'
    const label = response.Label || ''
    const score = response.Score || 0
    const keywords = response.Keywords || []

    // 判断是否安全
    const isSafe = suggestion === 'Pass'

    return {
      isSafe,
      suggestion,
      label,
      score,
      keywords,
      detail: response.DetailResults?.[0]?.Suggestion || '',
    }
  } catch (error) {
    console.error('腾讯云内容审核失败:', error)
    // 审核失败时，为了安全起见，返回不安全
    return {
      isSafe: false,
      suggestion: 'Block',
      label: 'Error',
      score: 100,
      detail: '内容审核服务暂时不可用，请稍后重试',
    }
  }
}

/**
 * 检测 HTML 内容是否违规（去除 HTML 标签后检测）
 * @param htmlContent HTML 内容
 * @returns 检测结果
 */
export async function moderateHTMLContent(htmlContent: string): Promise<ModerationResult> {
  // 去除 HTML 标签
  const textContent = htmlContent.replace(/<[^>]*>/g, ' ').trim()

  // 如果内容为空，直接通过
  if (!textContent) {
    return {
      isSafe: true,
      suggestion: 'Pass',
      label: '',
      score: 0,
    }
  }

  return moderateText(textContent)
}

/**
 * 格式化审核结果为用户友好的错误消息
 * @param result 审核结果
 * @returns 错误消息
 */
export function formatModerationError(result: ModerationResult): string {
  if (result.isSafe) {
    return ''
  }

  const labelMap: Record<string, string> = {
    Porn: '色情内容',
    Sexy: '性感内容',
    Polity: '政治敏感',
    Illegal: '违法违规',
    Abuse: '谩骂内容',
    Terror: '暴恐内容',
    Ad: '广告内容',
    Custom: '自定义违规',
  }

  const labelText = labelMap[result.label] || '不当内容'

  if (result.keywords && result.keywords.length > 0) {
    return `内容包含${labelText}，请修改后重新发布。检测到的关键词：${result.keywords.join('、')}`
  }

  return `内容包含${labelText}，请修改后重新发布。`
}
