import { ContentList } from '@/components/content/content-list'
import { Pagination } from '@/components/content/pagination'

interface UserContentsProps {
  contents: any[]
  username: string
  currentPage: number
  totalPages: number
}

export function UserContents({ contents, username, currentPage, totalPages }: UserContentsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">发布的内容</h2>
      <ContentList contents={contents} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/u/${username}`}
      />
    </div>
  )
}
