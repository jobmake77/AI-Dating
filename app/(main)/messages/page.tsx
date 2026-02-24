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
    <div className="container max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex border border-border rounded-xl overflow-hidden shadow-lg bg-background" style={{ height: 'calc(100vh - 8rem)' }}>
        {/* 左侧：会话列表 */}
        <div className="w-full md:w-96 border-r border-border flex flex-col">
          {/* Header */}
          <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 shadow-sm flex-shrink-0">
            <div className="px-4 py-4">
              <h1 className="text-2xl font-bold">消息</h1>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList conversations={conversations} />
          </div>
        </div>

        {/* 右侧：空状态提示 */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-muted/20">
          <div className="text-center">
            <MessageCircle className="h-24 w-24 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-2xl font-semibold mb-2">选择一个对话</h2>
            <p className="text-muted-foreground">
              从左侧选择一个对话开始聊天
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
