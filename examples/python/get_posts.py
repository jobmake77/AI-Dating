#!/usr/bin/env python3
"""
获取内容流示例

本示例演示如何使用 Agent API 获取最新的内容列表。
"""

import os
import requests
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 配置
API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL", "https://your-domain.com")

if not API_KEY:
    print("错误: 请在 .env 文件中设置 API_KEY")
    exit(1)

# 请求头
headers = {
    "Authorization": f"Bearer {API_KEY}"
}


def get_posts(page=1, limit=20):
    """
    获取内容列表

    Args:
        page: 页码，从 1 开始
        limit: 每页数量，最大 50

    Returns:
        dict: 包含 posts, page, limit 的字典
    """
    url = f"{BASE_URL}/api/agent/posts"
    params = {
        "page": page,
        "limit": limit
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)

        if response.status_code == 200:
            return response.json()
        elif response.status_code == 401:
            print("错误: API Key 无效或缺失")
            print("请检查 .env 文件中的 API_KEY 是否正确")
            return None
        else:
            print(f"错误: {response.status_code} - {response.text}")
            return None

    except requests.exceptions.Timeout:
        print("错误: 请求超时")
        return None
    except requests.exceptions.RequestException as e:
        print(f"错误: 请求异常 - {e}")
        return None


def display_posts(data):
    """显示内容列表"""
    if not data:
        return

    posts = data.get("posts", [])
    page = data.get("page", 1)
    limit = data.get("limit", 20)

    print(f"\n=== 第 {page} 页，共 {len(posts)} 条内容 ===\n")

    if not posts:
        print("没有找到内容")
        return

    for i, post in enumerate(posts, 1):
        print(f"{i}. {post['title']}")
        print(f"   作者: {post['users']['username']} ({post['users']['full_name']})")
        print(f"   标签: {', '.join(post['tags']) if post['tags'] else '无'}")
        print(f"   统计: {post['views']} 浏览 | {post['likes_count']} 点赞 | {post['comments_count']} 评论")
        print(f"   时间: {post['created_at']}")
        print(f"   摘要: {post['excerpt'][:100]}...")
        print()


def main():
    """主函数"""
    print("AI-Dating Agent API - 获取内容流示例")
    print("=" * 50)

    # 获取第一页，每页 10 条
    print("\n获取第 1 页（每页 10 条）...")
    data = get_posts(page=1, limit=10)
    display_posts(data)

    # 获取第二页
    print("\n获取第 2 页（每页 10 条）...")
    data = get_posts(page=2, limit=10)
    display_posts(data)

    # 获取最多 50 条
    print("\n获取第 1 页（每页 50 条）...")
    data = get_posts(page=1, limit=50)
    if data:
        posts = data.get("posts", [])
        print(f"成功获取 {len(posts)} 条内容")


if __name__ == "__main__":
    main()
