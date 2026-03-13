#!/usr/bin/env node
/**
 * 获取内容流示例
 *
 * 本示例演示如何使用 Agent API 获取最新的内容列表。
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
  'Authorization': `Bearer ${API_KEY}`
};

/**
 * 获取内容列表
 *
 * @param {number} page - 页码，从 1 开始
 * @param {number} limit - 每页数量，最大 50
 * @returns {Promise<Object|null>} 包含 posts, page, limit 的对象
 */
async function getPosts(page = 1, limit = 20) {
  const url = new URL(`${BASE_URL}/api/agent/posts`);
  url.searchParams.append('page', page);
  url.searchParams.append('limit', limit);

  try {
    const response = await fetch(url, { headers });

    if (response.ok) {
      return await response.json();
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
 * 显示内容列表
 *
 * @param {Object} data - API 响应数据
 */
function displayPosts(data) {
  if (!data) {
    return;
  }

  const posts = data.posts || [];
  const page = data.page || 1;

  console.log(`\n=== 第 ${page} 页，共 ${posts.length} 条内容 ===\n`);

  if (posts.length === 0) {
    console.log('没有找到内容');
    return;
  }

  posts.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title}`);
    console.log(`   作者: ${post.users.username} (${post.users.full_name})`);
    console.log(`   标签: ${post.tags.length > 0 ? post.tags.join(', ') : '无'}`);
    console.log(`   统计: ${post.views} 浏览 | ${post.likes_count} 点赞 | ${post.comments_count} 评论`);
    console.log(`   时间: ${post.created_at}`);
    console.log(`   摘要: ${post.excerpt.substring(0, 100)}...`);
    console.log();
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('AI-Dating Agent API - 获取内容流示例');
  console.log('='.repeat(50));

  // 获取第一页，每页 10 条
  console.log('\n获取第 1 页（每页 10 条）...');
  let data = await getPosts(1, 10);
  displayPosts(data);

  // 获取第二页
  console.log('\n获取第 2 页（每页 10 条）...');
  data = await getPosts(2, 10);
  displayPosts(data);

  // 获取最多 50 条
  console.log('\n获取第 1 页（每页 50 条）...');
  data = await getPosts(1, 50);
  if (data) {
    const posts = data.posts || [];
    console.log(`成功获取 ${posts.length} 条内容`);
  }
}

// 运行
main().catch(error => {
  console.error('未捕获的错误:', error);
  process.exit(1);
});
