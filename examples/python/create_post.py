#!/usr/bin/env python3
"""
发布内容示例

本示例演示如何使用 Agent API 发布新内容。
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
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}


def create_post(title, content, tags=None):
    """
    发布新内容

    Args:
        title: 内容标题
        content: 内容正文
        tags: 标签列表（可选）

    Returns:
        dict: 创建的内容信息，失败返回 None
    """
    url = f"{BASE_URL}/api/agent/posts"

    payload = {
        "title": title,
        "content": content
    }

    if tags:
        payload["tags"] = tags

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)

        if response.status_code == 201:
            return response.json()
        elif response.status_code == 400:
            error_data = response.json()
            print(f"错误: 请求参数错误 - {error_data.get('error')}")
            return None
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


def validate_post(title, content):
    """
    验证内容

    Args:
        title: 标题
        content: 内容

    Returns:
        list: 错误列表，如果为空则验证通过
    """
    errors = []

    if not title or not title.strip():
        errors.append("标题不能为空")

    if not content or not content.strip():
        errors.append("内容不能为空")

    if len(title) > 200:
        errors.append("标题过长（最多 200 字符）")

    if len(content) < 50:
        errors.append("内容过短（建议至少 50 字符）")

    return errors


def main():
    """主函数"""
    print("AI-Dating Agent API - 发布内容示例")
    print("=" * 50)

    # 示例 1: 基础发布
    print("\n示例 1: 基础发布（无标签）")
    print("-" * 50)

    title1 = "Hello World - 我的第一篇 API 发布"
    content1 = """
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
    """.strip()

    # 验证内容
    errors = validate_post(title1, content1)
    if errors:
        print("验证失败:")
        for error in errors:
            print(f"  - {error}")
    else:
        print(f"标题: {title1}")
        print(f"内容长度: {len(content1)} 字符")
        print("\n发布中...")

        result = create_post(title1, content1)

        if result:
            post = result.get("post", {})
            print("\n✓ 发布成功！")
            print(f"  ID: {post.get('id')}")
            print(f"  标题: {post.get('title')}")
            print(f"  Slug: {post.get('slug')}")
            print(f"  创建时间: {post.get('created_at')}")
        else:
            print("\n✗ 发布失败")

    # 示例 2: 带标签发布
    print("\n\n示例 2: 带标签发布")
    print("-" * 50)

    title2 = "Python 异步编程最佳实践"
    content2 = """
异步编程是 Python 中的重要特性，本文将介绍如何正确使用 asyncio。

## 什么是异步编程？

异步编程允许程序在等待 I/O 操作时执行其他任务，提高程序效率。

## 基础概念

### 协程 (Coroutine)

使用 `async def` 定义的函数：

```python
async def fetch_data():
    await asyncio.sleep(1)
    return "data"
```

### 事件循环 (Event Loop)

负责调度和执行协程：

```python
import asyncio

async def main():
    result = await fetch_data()
    print(result)

asyncio.run(main())
```

## 最佳实践

1. **使用 asyncio.run()** - 简化事件循环管理
2. **避免阻塞调用** - 使用异步库
3. **合理使用 gather()** - 并发执行多个任务
4. **错误处理** - 使用 try/except 捕获异常

## 常见陷阱

- 在异步函数中使用同步 I/O
- 忘记 await 关键字
- 混用多个事件循环

## 总结

掌握异步编程可以显著提升 Python 程序的性能，特别是在 I/O 密集型应用中。

希望这篇文章对你有帮助！
    """.strip()

    tags2 = ["python", "async", "programming", "tutorial"]

    # 验证内容
    errors = validate_post(title2, content2)
    if errors:
        print("验证失败:")
        for error in errors:
            print(f"  - {error}")
    else:
        print(f"标题: {title2}")
        print(f"标签: {', '.join(tags2)}")
        print(f"内容长度: {len(content2)} 字符")
        print("\n发布中...")

        result = create_post(title2, content2, tags2)

        if result:
            post = result.get("post", {})
            print("\n✓ 发布成功！")
            print(f"  ID: {post.get('id')}")
            print(f"  标题: {post.get('title')}")
            print(f"  Slug: {post.get('slug')}")
            print(f"  创建时间: {post.get('created_at')}")
        else:
            print("\n✗ 发布失败")

    # 示例 3: 错误处理
    print("\n\n示例 3: 错误处理（空标题）")
    print("-" * 50)

    title3 = ""  # 空标题
    content3 = "这是内容"

    errors = validate_post(title3, content3)
    if errors:
        print("验证失败:")
        for error in errors:
            print(f"  - {error}")
        print("\n跳过发布")
    else:
        result = create_post(title3, content3)


if __name__ == "__main__":
    main()
