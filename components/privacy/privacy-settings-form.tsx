"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Download, Trash2, Shield, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import {
  exportUserData,
  requestAccountDeletion,
  getUserPrivacySettings,
  getUserPrivacyRequestSummary,
  updateUserPrivacySettings,
} from "@/lib/actions/privacy"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

interface PrivacySettingsFormProps {
  userId: string
}

async function loadPrivacyPageData(userId: string) {
  const [settingsResult, summaryResult] = await Promise.all([
    getUserPrivacySettings(userId),
    getUserPrivacyRequestSummary(userId),
  ])

  return { settingsResult, summaryResult }
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
  const [requestSummary, setRequestSummary] = useState<{
    latestExportRequest: {
      status: string
      requested_at: string
      completed_at: string | null
      download_url: string | null
      expires_at: string | null
    } | null
    latestDeletionRequest: {
      status: string
      requested_at: string
      completed_at: string | null
    } | null
  }>({
    latestExportRequest: null,
    latestDeletionRequest: null,
  })

  const refreshPrivacyData = async () => {
    const { settingsResult, summaryResult } = await loadPrivacyPageData(userId)

    if (settingsResult.success && settingsResult.data) {
      setSettings(settingsResult.data)
    }

    if (summaryResult.success && summaryResult.data) {
      setRequestSummary(summaryResult.data)
    }
  }

  useEffect(() => {
    let isMounted = true

    const syncPrivacyData = async () => {
      const { settingsResult, summaryResult } = await loadPrivacyPageData(userId)

      if (!isMounted) {
        return
      }

      if (settingsResult.success && settingsResult.data) {
        setSettings(settingsResult.data)
      }

      if (summaryResult.success && summaryResult.data) {
        setRequestSummary(summaryResult.data)
      }
    }

    void syncPrivacyData()

    return () => {
      isMounted = false
    }
  }, [userId])

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "待处理"
      case "processing":
        return "处理中"
      case "completed":
        return "已完成"
      case "failed":
        return "失败"
      case "cancelled":
        return "已取消"
      default:
        return status
    }
  }

  const handleExportData = async () => {
    setExporting(true)
    try {
      const result = await exportUserData(userId)
      if (result.success) {
        toast.success("导出请求已提交，后台处理完成后可在此下载")
        await refreshPrivacyData()
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
        toast.success("账户注销请求已提交，后台审核通过后才会执行匿名化")
        await refreshPrivacyData()
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
            导出的数据会在后台完成后以 JSON 格式提供，包括您的个人资料、内容、评论、点赞等。
          </p>
          {requestSummary.latestExportRequest && (
            <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3 text-sm">
              <p className="font-medium text-foreground">
                最近一次请求：{getStatusLabel(requestSummary.latestExportRequest.status)}
              </p>
              <p className="mt-1 text-muted-foreground">
                提交时间：{new Date(requestSummary.latestExportRequest.requested_at).toLocaleString("zh-CN")}
              </p>
              {requestSummary.latestExportRequest.completed_at && (
                <p className="mt-1 text-muted-foreground">
                  完成时间：{new Date(requestSummary.latestExportRequest.completed_at).toLocaleString("zh-CN")}
                </p>
              )}
              {requestSummary.latestExportRequest.download_url && requestSummary.latestExportRequest.status === "completed" && (
                <Button asChild variant="secondary" size="sm" className="mt-3">
                  <Link href={requestSummary.latestExportRequest.download_url}>
                    下载已准备好的数据
                  </Link>
                </Button>
              )}
            </div>
          )}
          <Button
            variant="outline"
            onClick={handleExportData}
            disabled={exporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "提交中..." : "申请导出我的数据"}
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
            删除账户请求提交后会进入后台审核。审核通过后，您的所有数据将被匿名化处理。
            此操作无法撤销，您的内容会被标记为 &ldquo;已删除&rdquo; 以保留审计链。
          </p>
          {requestSummary.latestDeletionRequest && (
            <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3 text-sm">
              <p className="font-medium text-foreground">
                最近一次请求：{getStatusLabel(requestSummary.latestDeletionRequest.status)}
              </p>
              <p className="mt-1 text-muted-foreground">
                提交时间：{new Date(requestSummary.latestDeletionRequest.requested_at).toLocaleString("zh-CN")}
              </p>
              {requestSummary.latestDeletionRequest.completed_at && (
                <p className="mt-1 text-muted-foreground">
                  完成时间：{new Date(requestSummary.latestDeletionRequest.completed_at).toLocaleString("zh-CN")}
                </p>
              )}
            </div>
          )}
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
                  这会向后台提交注销请求。审核通过后，您的账户将被匿名化处理，
                  您将无法恢复自己的内容、评论或其他数据。
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
