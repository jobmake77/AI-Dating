import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getConversationMessages, getConversationOtherUser, getUserConversations } from '@/lib/queries/chat'
import { ChatMessages } from '@/components/chat/chat-messages'
import { ChatInput } from '@/components/chat/chat-input'
import { ConversationList } from '@/components/chat/conversation-list'
import { Button } from '@/components/ui/button'
import { Phone, Video } from 'lucide-react'
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
      <div className="mx-auto max-w-5xl px-4 py-4">
        <div className="flex rounded-lg border border-border bg-card overflow-hidden shadow-card" style={{ height: 'calc(100vh - 80px)' }}>
          {/* 左侧：会话列表 */}
          <div className="w-72 shrink-0 border-r border-border flex flex-col">
            <div className="p-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground mb-2">消息</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConversationList conversations={conversations} activeConversationId={id} />
            </div>
          </div>

          {/* 右侧：聊天区域 */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
                  {(otherUser?.full_name || otherUser?.username || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <Link
                    href={`/u/${otherUser?.username}`}
                    className="text-sm font-medium text-foreground block hover:underline"
                  >
                    {otherUser?.full_name || otherUser?.username}
                  </Link>
                  <span className="flex items-center gap-1 text-[10px] text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> 在线
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-info">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent">
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <ChatMessages
                conversationId={id}
                initialMessages={messagesData.messages}
                otherUserLastReadAt={messagesData.otherUserLastReadAt}
                currentUserId={user.id}
              />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 flex items-end gap-2 bg-card">
              <ChatInput conversationId={id} />
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
