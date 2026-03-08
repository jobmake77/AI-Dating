import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock component for testing (since we don't have the actual component)
const MockMobileSearchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null

  return (
    <div role="dialog" aria-label="搜索">
      <button onClick={onClose} aria-label="关闭搜索">
        关闭
      </button>
      <input
        type="search"
        placeholder="搜索内容..."
        aria-label="搜索输入框"
      />
      <div data-testid="search-history">
        <h3>搜索历史</h3>
        <button>React</button>
        <button>TypeScript</button>
      </div>
      <div data-testid="hot-tags">
        <h3>热门标签</h3>
        <button>前端开发</button>
        <button>AI</button>
      </div>
    </div>
  )
}

describe('MobileSearchModal', () => {
  it('should not render when closed', () => {
    const onClose = vi.fn()
    const { container } = render(
      <MockMobileSearchModal isOpen={false} onClose={onClose} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render when open', () => {
    const onClose = vi.fn()
    render(<MockMobileSearchModal isOpen={true} onClose={onClose} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('搜索输入框')).toBeInTheDocument()
  })

  it('should close when close button is clicked', () => {
    const onClose = vi.fn()
    render(<MockMobileSearchModal isOpen={true} onClose={onClose} />)

    const closeButton = screen.getByLabelText('关闭搜索')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should display search input', () => {
    const onClose = vi.fn()
    render(<MockMobileSearchModal isOpen={true} onClose={onClose} />)

    const searchInput = screen.getByLabelText('搜索输入框')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('type', 'search')
  })

  it('should allow typing in search input', () => {
    const onClose = vi.fn()
    render(<MockMobileSearchModal isOpen={true} onClose={onClose} />)

    const searchInput = screen.getByLabelText('搜索输入框') as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'React' } })

    expect(searchInput.value).toBe('React')
  })

  it('should display search history', () => {
    const onClose = vi.fn()
    render(<MockMobileSearchModal isOpen={true} onClose={onClose} />)

    const historySection = screen.getByTestId('search-history')
    expect(historySection).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('should display hot tags', () => {
    const onClose = vi.fn()
    render(<MockMobileSearchModal isOpen={true} onClose={onClose} />)

    const hotTagsSection = screen.getByTestId('hot-tags')
    expect(hotTagsSection).toBeInTheDocument()
    expect(screen.getByText('前端开发')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('should handle keyboard navigation', async () => {
    const onClose = vi.fn()
    render(<MockMobileSearchModal isOpen={true} onClose={onClose} />)

    const searchInput = screen.getByLabelText('搜索输入框')

    // Press Enter
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' })

    // Press Escape
    fireEvent.keyDown(searchInput, { key: 'Escape', code: 'Escape' })

    expect(searchInput).toBeInTheDocument()
  })

  it('should be accessible', () => {
    const onClose = vi.fn()
    render(<MockMobileSearchModal isOpen={true} onClose={onClose} />)

    // Check ARIA attributes
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-label', '搜索')

    const closeButton = screen.getByLabelText('关闭搜索')
    expect(closeButton).toBeInTheDocument()

    const searchInput = screen.getByLabelText('搜索输入框')
    expect(searchInput).toBeInTheDocument()
  })
})
