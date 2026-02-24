/**
 * 敏感词检测工具
 * MVP 版本：使用简单的关键词列表
 */

// 敏感词列表（可以根据需要扩展）
const SENSITIVE_WORDS = [
  // 政治敏感词
  '习近平', '胡锦涛', '江泽民', '毛泽东', '邓小平',
  '共产党', '中共', '政府', '党中央',

  // 暴力相关
  '杀人', '自杀', '爆炸', '恐怖', '暴力',

  // 色情相关
  '色情', '黄色', '裸体', '性交', 'porn',

  // 赌博相关
  '赌博', '博彩', '六合彩', '赌场',

  // 违法相关
  '毒品', '贩毒', '走私', '洗钱', '诈骗',

  // 其他
  '法轮功', '邪教',
]

/**
 * 检测文本中是否包含敏感词
 * @param text 要检测的文本
 * @returns 检测结果
 */
export function detectSensitiveWords(text: string): {
  hasSensitiveWords: boolean
  words: string[]
} {
  const foundWords: string[] = []
  const lowerText = text.toLowerCase()

  for (const word of SENSITIVE_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      foundWords.push(word)
    }
  }

  return {
    hasSensitiveWords: foundWords.length > 0,
    words: foundWords,
  }
}

/**
 * 检测 HTML 内容中的敏感词（去除 HTML 标签后检测）
 * @param htmlContent HTML 内容
 * @returns 检测结果
 */
export function detectSensitiveWordsInHTML(htmlContent: string): {
  hasSensitiveWords: boolean
  words: string[]
} {
  // 去除 HTML 标签
  const textContent = htmlContent.replace(/<[^>]*>/g, '')
  return detectSensitiveWords(textContent)
}

/**
 * 高亮显示敏感词（用于前端展示）
 * @param text 原文本
 * @param words 敏感词列表
 * @returns 高亮后的文本
 */
export function highlightSensitiveWords(text: string, words: string[]): string {
  let result = text
  for (const word of words) {
    const regex = new RegExp(word, 'gi')
    result = result.replace(regex, `**${word}**`)
  }
  return result
}
