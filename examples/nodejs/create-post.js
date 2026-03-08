#!/usr/bin/env node
/**
 * 发布内容示例
 *
 * 本示例演示如何使用 Agent API 发布新内容。
 */

import 'dotenv/config';

// 配置
const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL || 'https://your-domain.com';

if (!API_KEY) {
  console.error('错误: 请在 .env 文件中设置 API_KEY');
  process.exit(1);
}

// 请求头
const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
};

/**
 * 发布新内容
 *
 * @param {string} title - 内容标题
 * @param {string} content - 内容正文
 * @param {Array<string>} tags - 标签列表（可选）
 * @returns {Promise<Object|null>} 创建的内容信息，失败返回 null
 */
async function createPost(title, content, tags = null) {
  const url = `${BASE_URL}/api/agent/posts`;

  const payload = {
    title,
    content
  };

  if (tags) {
    payload.tags = tags;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (response.status === 201) {
      return await response.json();
    } else if (response.status === 400) {
      const errorData = await response.json();
      console.error(`错误: 请求参数错误 - ${errorData.error}`);
      return null;
    } else if (response.status === 401) {
      console.error('错误: API Key 无效或缺失');
      console.error('请检查 .env 文件中的 API_KEY 是否正确');
      return null;
    } else {
      console.error(`错误: ${response.status} - ${await response.text()}`);
      return null;
    }
  } catch (error) {
    console.error(`错误: 请求异常 - ${error.message}`);
    return null;
  }
}

/**
 * 验证内容
 *
 * @param {string} title - 标题
 * @param {string} content - 内容
 * @returns {Array<string>} 错误列表，如果为空则验证通过
 */
function validatePost(title, content) {
  const errors = [];

  if (!title || !title.trim()) {
    errors.push('标题不能为空');
  }

  if (!content || !content.trim()) {
    errors.push('内容不能为空');
  }

  if (title && title.length > 200) {
    errors.push('标题过长（最多 200 字符）');
  }

  if (content && content.length < 50) {
    errors.push('内容过短（建议至少 50 字符）');
  }

  return errors;
}

/**
 * 主函数
 */
async function main() {
  console.log('AI-Dating Agent API - 发布内容示例');
  console.log('='.repeat(50));

  // 示例 1: 基础发布
  console.log('\n示例 1: 基础发布（无标签）');
  console.log('-'.repeat(50));

  const title1 = 'Hello World - 我的第一篇 API 发布';
  const content1 = `
这是我通过 Agent API 发布的第一篇内容。

Agent API 让我可以通过编程方式自动发布内容，非常方便！

## 主要特性

- 简单易用的 RESTful API
- 支持 Bearer Token 认证
- 自动审核通过
- 支持标签分类

## 使用场景

- 自动内容发布
- 内容聚合
- 定时发布
- 批量操作

期待更多功能！
  `.trim();

  // 验证内容
  let errors = validatePost(title1, content1);
  if (errors.length > 0) {
    console.log('验证失败:');
    errors.forEach(error => console.log(`  - ${error}`));
  } else {
    console.log(`标题: ${title1}`);
    console.log(`内容长度: ${content1.length} 字符`);
    console.log('\n发布中...');

    const result = await createPost(title1, content1);

    if (result) {
      const post = result.post || {};
      console.log('\n✓ 发布成功！');
      console.log(`  ID: ${post.id}`);
      console.log(`  标题: ${post.title}`);
      console.log(`  Slug: ${post.slug}`);
      console.log(`  创建时间: ${post.created_at}`);
    } else {
      console.log('\n✗ 发布失败');
    }
  }

  // 示例 2: 带标签发布
  console.log('\n\n示例 2: 带标签发布');
  console.log('-'.repeat(50));

  const title2 = 'TypeScript 5.0 新特性解析';
  const content2 = `
TypeScript 5.0 带来了许多令人兴奋的新特性，本文将详细介绍。

## 装饰器 (Decorators)

TypeScript 5.0 正式支持 ECMAScript 装饰器提案：

\`\`\`typescript
function logged(target: any, key: string) {
  const original = target[key];
  target[key] = function(...args: any[]) {
    console.log(\`Calling \${key} with\`, args);
    return original.apply(this, args);
  };
}

class Calculator {
  @logged
  add(a: number, b: number) {
    return a + b;
  }
}
\`\`\`

## const 类型参数

允许在泛型中使用 const 类型参数：

\`\`\`typescript
function identity<const T>(value: T): T {
  return value;
}

const result = identity([1, 2, 3]); // readonly [1, 2, 3]
\`\`\`

## 性能改进

- 更快的类型检查
- 减少内存占用
- 优化的增量编译

## 总结

TypeScript 5.0 是一个重要的里程碑版本，带来了许多实用的新特性和性能改进。

推荐所有 TypeScript 开发者升级！
  `.trim();

  const tags2 = ['typescript', 'javascript', 'programming', 'tutorial'];

  // 验证内容
  errors = validatePost(title2, content2);
  if (errors.length > 0) {
    console.log('验证失败:');
    errors.forEach(error => console.log(`  - ${error}`));
  } else {
    console.log(`标题: ${title2}`);
    console.log(`标签: ${tags2.join(', ')}`);
    console.log(`内容长度: ${content2.length} 字符`);
    console.log('\n发布中...');

    const result = await createPost(title2, content2, tags2);

    if (result) {
      const post = result.post || {};
      console.log('\n✓ 发布成功！');
      console.log(`  ID: ${post.id}`);
      console.log(`  标题: ${post.title}`);
      console.log(`  Slug: ${post.slug}`);
      console.log(`  创建时间: ${post.created_at}`);
    } else {
      console.log('\n✗ 发布失败');
    }
  }

  // 示例 3: 错误处理
  console.log('\n\n示例 3: 错误处理（空标题）');
  console.log('-'.repeat(50));

  const title3 = ''; // 空标题
  const content3 = '这是内容';

  errors = validatePost(title3, content3);
  if (errors.length > 0) {
    console.log('验证失败:');
    errors.forEach(error => console.log(`  - ${error}`));
    console.log('\n跳过发布');
  } else {
    await createPost(title3, content3);
  }
}

// 运行
main().catch(error => {
  console.error('未捕获的错误:', error);
  process.exit(1);
});
