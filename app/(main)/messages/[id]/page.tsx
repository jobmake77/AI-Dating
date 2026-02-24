import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getConversationMessages, getConversationOtherUser, getUserConversations } from '@/lib/queries/chat'
import { ChatMessages } from '@/components/chat/chat-messages'
import { ChatInput } from '@/components/chat/chat-input'
import { ConversationList } from '@/components/chat/conversation-list'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ChatPageProps {
  params: Promise<{ id: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  try {
    // 验证用户是否是会话参与者
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', id)
      .eq('user_id', user.id)
      .single()

    if (!participant) {
      notFound()
    }

    const messagesData = await getConversationMessages(id, user.id)
    const otherUser = await getConversationOtherUser(id, user.id)
    const conversations = await getUserConversations(user.id)

    return (
      <div className="container max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex border border-border rounded-xl overflow-hidden shadow-lg bg-background" style={{ height: 'calc(100vh - 8rem)' }}>
          {/* 左侧：会话列表（桌面端显示） */}
          <div className="hidden md:flex md:w-96 border-r border-border flex-col">
            {/* Header */}
            <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 shadow-sm flex-shrink-0">
              <div className="px-4 py-4">
                <h1 className="text-2xl font-bold">消息</h1>
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              <ConversationList conversations={conversations} activeConversationId={id} />
            </div>
          </div>

          {/* 右侧：聊天区域 */}
          <div className="flex-1 flex flex-col bg-muted/30">
            {/* Header */}
            <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 shadow-sm flex-shrink-0">
              <div className="flex items-center gap-3 px-4 py-3">
                <Button variant="ghost" size="icon" className="shrink-0 md:hidden" asChild>
                  <Link href="/messages">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>

                <Link
                  href={`/u/${otherUser?.username}`}
                  className="flex items-center gap-3 flex-1 min-w-0 hover:bg-muted/50 rounded-lg px-2 py-1 -mx-2 transition-colors"
                >
                  <Avatar className="h-11 w-11 shrink-0 ring-2 ring-background">
                    <AvatarImage src={otherUser?.avatar || undefined} />
                    <AvatarFallback className="text-base font-semibold">
                      {(otherUser?.full_name || otherUser?.username || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {otherUser?.full_name || otherUser?.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{otherUser?.username}
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden bg-muted/20">
              <ChatMessages
                conversationId={id}
                initialMessages={messagesData.messages}
                otherUserLastReadAt={messagesData.otherUserLastReadAt}
                currentUserId={user.id}
              />
            </div>

            {/* Input */}
            <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg flex-shrink-0">
              <div className="px-4 py-3">
                <ChatInput conversationId={id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
