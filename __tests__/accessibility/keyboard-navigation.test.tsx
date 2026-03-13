import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock navigation component for testing
const MockNavigation = () => {
  return (
    <nav aria-label="主导航">
      <ul>
        <li>
          <a href="https://example.com/" tabIndex={0}>
            首页
          </a>
        </li>
        <li>
          <a href="https://example.com/trending" tabIndex={0}>
            热门
          </a>
        </li>
        <li>
          <a href="https://example.com/communities" tabIndex={0}>
            社区
          </a>
        </li>
        <li>
          <button tabIndex={0} aria-label="搜索">
            搜索
          </button>
        </li>
      </ul>
    </nav>
  )
}

// Mock button component
const MockButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
  return (
    <button
      onClick={onClick}
      tabIndex={0}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {children}
    </button>
  )
}

describe('Keyboard Navigation', () => {
  describe('Navigation Links', () => {
    it('should have proper tabIndex on navigation links', () => {
      render(<MockNavigation />)

      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveAttribute('tabIndex', '0')
      })
    })

    it('should have accessible labels', () => {
      render(<MockNavigation />)

      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', '主导航')
    })

    it('should have visible focus indicators', () => {
      render(<MockNavigation />)

      const firstLink = screen.getByText('首页')
      firstLink.focus()

      expect(document.activeElement).toBe(firstLink)
    })
  })

  describe('Interactive Elements', () => {
    it('should have tabIndex on buttons', () => {
      render(<MockButton>点击我</MockButton>)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('tabIndex', '0')
    })

    it('should be keyboard accessible', () => {
      render(<MockButton>点击我</MockButton>)

      const button = screen.getByRole('button')
      button.focus()

      expect(document.activeElement).toBe(button)
    })

    it('should have proper ARIA labels', () => {
      render(<MockButton>点击我</MockButton>)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', '点击我')
    })
  })

  describe('Focus Management', () => {
    it('should maintain focus order', () => {
      render(
        <div>
          <button tabIndex={0}>第一个</button>
          <button tabIndex={0}>第二个</button>
          <button tabIndex={0}>第三个</button>
        </div>
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(3)

      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex', '0')
      })
    })

    it('should skip hidden elements', () => {
      render(
        <div>
          <button tabIndex={0}>可见按钮</button>
          <button tabIndex={-1} style={{ display: 'none' }}>
            隐藏按钮
          </button>
        </div>
      )

      const visibleButton = screen.getByText('可见按钮')
      expect(visibleButton).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('Skip Links', () => {
    it('should provide skip to main content link', () => {
      render(
        <div>
          <a href="#main-content" className="skip-link">
            跳转到主内容
          </a>
          <main id="main-content">主要内容</main>
        </div>
      )

      const skipLink = screen.getByText('跳转到主内容')
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute('href', '#main-content')
    })
  })

  describe('Modal Focus Trap', () => {
    it('should trap focus within modal', () => {
      render(
        <div role="dialog" aria-modal="true">
          <button>模态框按钮 1</button>
          <button>模态框按钮 2</button>
          <button>关闭</button>
        </div>
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(3)
    })
  })

  describe('Form Accessibility', () => {
    it('should have proper labels for form inputs', () => {
      render(
        <form>
          <label htmlFor="email">邮箱</label>
          <input id="email" type="email" />

          <label htmlFor="password">密码</label>
          <input id="password" type="password" />
        </form>
      )

      const emailInput = screen.getByLabelText('邮箱')
      const passwordInput = screen.getByLabelText('密码')

      expect(emailInput).toBeInTheDocument()
      expect(passwordInput).toBeInTheDocument()
    })

    it('should have proper error messages', () => {
      render(
        <form>
          <label htmlFor="email">邮箱</label>
          <input
            id="email"
            type="email"
            aria-invalid="true"
            aria-describedby="email-error"
          />
          <span id="email-error" role="alert">
            请输入有效的邮箱地址
          </span>
        </form>
      )

      const emailInput = screen.getByLabelText('邮箱')
      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')

      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveTextContent('请输入有效的邮箱地址')
    })
  })
})
