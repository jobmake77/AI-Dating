"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Download, Trash2, Shield, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { exportUserData, requestAccountDeletion, getUserPrivacySettings, updateUserPrivacySettings } from "@/lib/actions/privacy"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PrivacySettingsFormProps {
  userId: string
}

export function PrivacySettingsForm({ userId }: PrivacySettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [settings, setSettings] = useState({
    profile_visibility: "public" as "public" | "private" | "followers_only",
    show_email: false,
    show_location: false,
    allow_messages: true,
    allow_notifications: true,
  })

  useEffect(() => {
    async function loadSettings() {
      const result = await getUserPrivacySettings(userId)
      if (result.success && result.data) {
        setSettings(result.data)
      }
    }

    void loadSettings()
  }, [userId])

  const handleExportData = async () => {
    setExporting(true)
    try {
      const result = await exportUserData(userId)
      if (result.success && result.data) {
        // Create download link
        const dataStr = JSON.stringify(result.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `ai-dating-data-export-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success("数据导出成功")
      } else {
        toast.error(result.error || "导出失败")
      }
    } catch {
      toast.error("导出数据时出错")
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const result = await requestAccountDeletion(userId)
      if (result.success) {
        toast.success("账户删除请求已提交")
        // Redirect to logout
        window.location.href = "/logout"
      } else {
        toast.error(result.error || "删除失败")
      }
    } catch {
      toast.error("删除账户时出错")
    } finally {
      setDeleting(false)
    }
  }

  const handleUpdateSettings = async () => {
    setLoading(true)
    try {
      const result = await updateUserPrivacySettings(userId, settings)
      if (result.success) {
        toast.success("隐私设置已更新")
      } else {
        toast.error(result.error || "更新失败")
      }
    } catch {
      toast.error("更新设置时出错")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            隐私设置
          </CardTitle>
          <CardDescription>
            控制谁可以看到您的信息和与您互动
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Visibility */}
          <div className="space-y-2">
            <Label htmlFor="profile_visibility">个人资料可见性</Label>
            <Select
              value={settings.profile_visibility}
              onValueChange={(value: "public" | "private" | "followers_only") =>
                setSettings((current) => ({ ...current, profile_visibility: value }))
              }
            >
              <SelectTrigger id="profile_visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    公开 - 所有人可见
                  </div>
                </SelectItem>
                <SelectItem value="followers_only">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    仅关注者可见
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    私密 - 仅自己可见
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              控制谁可以查看您的个人资料
            </p>
          </div>

          <Separator />

          {/* Show Email */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>显示邮箱地址</Label>
              <p className="text-sm text-muted-foreground">
                在您的个人资料上显示邮箱地址
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.show_email}
              onChange={(e) =>
                setSettings({ ...settings, show_email: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>

          <Separator />

          {/* Show Location */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>显示位置信息</Label>
              <p className="text-sm text-muted-foreground">
                在您的个人资料上显示位置
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.show_location}
              onChange={(e) =>
                setSettings({ ...settings, show_location: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>

          <Separator />

          {/* Allow Messages */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>允许私信</Label>
              <p className="text-sm text-muted-foreground">
                允许其他用户向您发送私信
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.allow_messages}
              onChange={(e) =>
                setSettings({ ...settings, allow_messages: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>

          <Separator />

          {/* Allow Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>允许通知</Label>
              <p className="text-sm text-muted-foreground">
                接收关于您账户活动的通知
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.allow_notifications}
              onChange={(e) =>
                setSettings({ ...settings, allow_notifications: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>

          <div className="pt-4">
            <Button onClick={handleUpdateSettings} disabled={loading}>
              {loading ? "保存中..." : "保存设置"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            数据导出
          </CardTitle>
          <CardDescription>
            下载您在 AI-Dating 上的所有数据副本
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            根据 GDPR 规定，您有权获取我们存储的关于您的所有数据。
            导出的数据将以 JSON 格式提供，包括您的个人资料、内容、评论、点赞等。
          </p>
          <Button
            variant="outline"
            onClick={handleExportData}
            disabled={exporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "导出中..." : "导出我的数据"}
          </Button>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            删除账户
          </CardTitle>
          <CardDescription>
            永久删除您的账户和所有相关数据
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            删除账户后，您的所有数据将被匿名化处理。此操作无法撤销。
            您的内容将被标记为 &ldquo;已删除&rdquo;，但会保留用于审计目的。
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                删除我的账户
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确定要删除账户吗？</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作无法撤销。您的账户将被永久删除，所有数据将被匿名化。
                  您将无法恢复您的内容、评论或其他数据。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "删除中..." : "确认删除"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
