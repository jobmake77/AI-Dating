"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Cookie, Settings } from "lucide-react"
import Link from "next/link"

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

type ConsentUpdateParams = {
  analytics_storage: 'granted' | 'denied'
  ad_storage: 'granted' | 'denied'
}

type WindowWithGtag = Window & {
  gtag?: (command: 'consent', action: 'update', params: ConsentUpdateParams) => void
}

const COOKIE_CONSENT_KEY = "cookie-consent"
const COOKIE_PREFERENCES_KEY = "cookie-preferences"
const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
}

function getStoredPreferences(): CookiePreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES
  }

  const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
  if (!savedPreferences) {
    return DEFAULT_PREFERENCES
  }

  try {
    return JSON.parse(savedPreferences) as CookiePreferences
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(() =>
    typeof window === "undefined" ? false : !localStorage.getItem(COOKIE_CONSENT_KEY)
  )
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(getStoredPreferences)

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true")
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs))
    setPreferences(prefs)
    setShowBanner(false)
    setShowSettings(false)

    // Trigger analytics consent update
    const windowWithGtag = window as WindowWithGtag
    if (windowWithGtag.gtag) {
      windowWithGtag.gtag("consent", "update", {
        analytics_storage: prefs.analytics ? "granted" : "denied",
        ad_storage: prefs.marketing ? "granted" : "denied",
      })
    }
  }

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
    })
  }

  const rejectAll = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    })
  }

  const openSettings = () => {
    setShowSettings(true)
  }

  const saveCustomPreferences = () => {
    savePreferences(preferences)
  }

  if (!showBanner && !showSettings) {
    return null
  }

  return (
    <>
      {/* Cookie Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">我们使用 Cookie</h3>
                  <p className="text-sm text-muted-foreground">
                    我们使用 Cookie 来改善您的浏览体验、提供个性化内容和分析网站流量。
                    通过点击 &ldquo;接受全部&rdquo;，您同意我们使用 Cookie。
                    {" "}
                    <Link href="/privacy" className="underline hover:text-primary">
                      隐私政策
                    </Link>
                    {" | "}
                    <Link href="/cookies" className="underline hover:text-primary">
                      Cookie 政策
                    </Link>
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={rejectAll}
                  className="w-full sm:w-auto"
                >
                  拒绝全部
                </Button>
                <Button
                  variant="outline"
                  onClick={openSettings}
                  className="w-full sm:w-auto"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  自定义
                </Button>
                <Button
                  onClick={acceptAll}
                  className="w-full sm:w-auto"
                >
                  接受全部
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cookie 偏好设置</DialogTitle>
            <DialogDescription>
              管理您的 Cookie 偏好。您可以随时更改这些设置。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">必要 Cookie</Label>
                  <p className="text-sm text-muted-foreground">
                    这些 Cookie 对于网站的基本功能是必需的，无法禁用。
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground">总是启用</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                用于：身份验证、安全性、会话管理
              </p>
            </div>

            <Separator />

            {/* Analytics Cookies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="text-base font-semibold">分析 Cookie</Label>
                  <p className="text-sm text-muted-foreground">
                    帮助我们了解访问者如何使用我们的网站，以便改进用户体验。
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences({ ...preferences, analytics: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                用于：Google Analytics、页面浏览统计、用户行为分析
              </p>
            </div>

            <Separator />

            {/* Marketing Cookies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="text-base font-semibold">营销 Cookie</Label>
                  <p className="text-sm text-muted-foreground">
                    用于跟踪访问者并显示相关广告和营销活动。
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) =>
                      setPreferences({ ...preferences, marketing: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                用于：广告投放、转化跟踪、再营销
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              取消
            </Button>
            <Button onClick={saveCustomPreferences}>
              保存偏好
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
