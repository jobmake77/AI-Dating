"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Cookie, Settings } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "use-intl"

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
  const t = useTranslations('cookieConsent')
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
                  <h3 className="font-semibold text-lg">{t('title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('bannerDescription')}
                    {" "}
                    <Link href="/privacy" className="underline hover:text-primary">
                      {t('privacyPolicy')}
                    </Link>
                    {" | "}
                    <Link href="/cookies" className="underline hover:text-primary">
                      {t('cookiePolicy')}
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
                  {t('rejectAll')}
                </Button>
                <Button
                  variant="outline"
                  onClick={openSettings}
                  className="w-full sm:w-auto"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {t('customize')}
                </Button>
                <Button
                  onClick={acceptAll}
                  className="w-full sm:w-auto"
                >
                  {t('acceptAll')}
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
            <DialogTitle>{t('settingsTitle')}</DialogTitle>
            <DialogDescription>
              {t('settingsDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">{t('necessaryTitle')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('necessaryDescription')}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground">{t('alwaysOn')}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('necessaryUsage')}
              </p>
            </div>

            <Separator />

            {/* Analytics Cookies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="text-base font-semibold">{t('analyticsTitle')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('analyticsDescription')}
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
                {t('analyticsUsage')}
              </p>
            </div>

            <Separator />

            {/* Marketing Cookies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="text-base font-semibold">{t('marketingTitle')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('marketingDescription')}
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
                {t('marketingUsage')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={saveCustomPreferences}>
              {t('savePreferences')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
