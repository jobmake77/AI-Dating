import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('应该正确渲染按钮', () => {
    render(<Button>点击我</Button>)
    const button = screen.getByRole('button', { name: /点击我/i })
    expect(button).toBeInTheDocument()
  })

  it('应该支持不同的变体', () => {
    const { rerender } = render(<Button variant="default">默认按钮</Button>)
    let button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary')

    rerender(<Button variant="destructive">删除按钮</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')

    rerender(<Button variant="outline">轮廓按钮</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('border')
  })

  it('应该支持不同的尺寸', () => {
    const { rerender } = render(<Button size="default">默认尺寸</Button>)
    let button = screen.getByRole('button')
    expect(button).toHaveClass('h-9')

    rerender(<Button size="sm">小尺寸</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('h-8')

    rerender(<Button size="lg">大尺寸</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('h-10')
  })

  it('应该处理点击事件', async () => {
    const user = userEvent.setup()
    let clicked = false
    const handleClick = () => {
      clicked = true
    }

    render(<Button onClick={handleClick}>点击测试</Button>)
    const button = screen.getByRole('button')

    await user.click(button)
    expect(clicked).toBe(true)
  })

  it('应该支持禁用状态', () => {
    render(<Button disabled>禁用按钮</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50')
  })

  it('应该支持自定义 className', () => {
    render(<Button className="custom-class">自定义类</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('应该支持 aria 属性', () => {
    render(
      <Button aria-label="关闭对话框" aria-pressed={true}>
        关闭
      </Button>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', '关闭对话框')
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })
})
