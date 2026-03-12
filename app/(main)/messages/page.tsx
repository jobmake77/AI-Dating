import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserConversations } from '@/lib/queries/chat'
import { ConversationList } from '@/components/chat/conversation-list'
import { MessageCircle } from 'lucide-react'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const conversations = await getUserConversations(user.id)

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      <div className="flex rounded-lg border border-border bg-card overflow-hidden shadow-card" style={{ height: 'calc(100vh - 80px)' }}>
        {/* 左侧：会话列表 */}
        <div className="w-72 shrink-0 border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-border">
            <h2 className="text-sm font-bold text-foreground mb-2">消息</h2>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList conversations={conversations} />
          </div>
        </div>

        {/* 右侧：空状态提示 */}
        <div className="flex-1 flex items-center justify-center bg-secondary/20">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 mx-auto mb-3 text-muted-foreground/50" />
            <h2 className="text-lg font-semibold mb-1 text-foreground">选择一个对话</h2>
            <p className="text-sm text-muted-foreground">
              从左侧选择一个对话开始聊天
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
