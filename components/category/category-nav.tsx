import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants/categories'
import { Badge } from '@/components/ui/badge'

interface CategoryNavProps {
  currentSlug?: string
}

export function CategoryNav({ currentSlug }: CategoryNavProps) {
  return (
    <nav className="flex flex-wrap gap-2 mb-8">
      <Link href="/contents">
        <Badge
          variant={!currentSlug ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-primary/90"
        >
          全部
        </Badge>
      </Link>
      {Object.values(CATEGORIES).map((category) => (
        <Link key={category.slug} href={`/category/${category.slug}`}>
          <Badge
            variant={currentSlug === category.slug ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/90"
          >
            {category.icon} {category.name}
          </Badge>
        </Link>
      ))}
    </nav>
  )
}
