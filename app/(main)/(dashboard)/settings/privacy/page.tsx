import { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PrivacySettingsForm } from "@/components/privacy/privacy-settings-form"

export const metadata: Metadata = {
  title: "隐私设置",
  description: "管理您的隐私和数据设置",
}

export default async function PrivacySettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">隐私设置</h1>
          <p className="text-muted-foreground mt-2">
            管理您的隐私偏好和数据
          </p>
        </div>

        <PrivacySettingsForm userId={user.id} />
      </div>
    </div>
  )
}
