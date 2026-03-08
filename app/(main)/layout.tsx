import { SiteHeader } from "@/components/layout/site-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { OnboardingProvider } from "@/components/onboarding";
import { createClient } from "@/lib/supabase/server";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userData = null
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('username, role, avatar')
      .eq('id', user.id)
      .single()

    userData = {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
      username: data?.username || null,
      role: data?.role || null,
      avatar: data?.avatar || null,
    }
  }

  return (
    <OnboardingProvider userId={userData?.id}>
      <a href="#main-content" className="skip-link">
        跳到主内容
      </a>
      <SiteHeader serverUser={userData} />
      <div className="flex pb-16 lg:pb-0 justify-center">
        {/* 左侧导航 - 靠右对齐，紧贴内容区 */}
        <div className="hidden lg:flex lg:w-[220px] xl:w-[260px] justify-end flex-shrink-0">
          <LeftSidebar />
        </div>

        {/* 主内容区 + 右侧边栏 */}
        <main id="main-content" className="flex flex-1 min-w-0 max-w-[990px]">
          {children}
        </main>
      </div>
      <MobileBottomNav
        isAuthenticated={!!userData}
        username={userData?.username}
      />
    </OnboardingProvider>
  )
}
