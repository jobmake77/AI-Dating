import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface AuthorCardProps {
  author: {
    id: string
    username: string
    avatar: string | null
    full_name: string | null
    bio: string | null
  }
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">关于作者</h3>
      </CardHeader>
      <CardContent>
        <Link href={`/u/${author.username}`} className="flex items-start gap-4 hover:opacity-80 transition-opacity">
          <Avatar className="h-12 w-12">
            <AvatarImage src={author.avatar || undefined} alt={author.full_name || author.username} />
            <AvatarFallback>
              {(author.full_name || author.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{author.full_name || author.username}</p>
            <p className="text-sm text-muted-foreground">@{author.username}</p>
            {author.bio && (
              <p className="text-sm text-muted-foreground mt-2">{author.bio}</p>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
