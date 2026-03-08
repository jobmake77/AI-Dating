'use client'

/**
 * Appearance Settings Component
 * Comprehensive appearance customization panel
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { ThemeColorPicker } from '@/components/theme/theme-color-picker'
import { FontSizeControl } from '@/components/theme/font-size-control'
import { HighContrastToggle } from '@/components/theme/high-contrast-toggle'
import { useTheme } from '@/components/theme/theme-provider'

export function AppearanceSettings() {
  const { preferences } = useTheme()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">外观设置</h2>
        <p className="text-muted-foreground mt-1">
          自定义界面外观，让使用体验更符合你的喜好
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>主题模式</CardTitle>
          <CardDescription>
            选择浅色、深色或跟随系统设置
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">当前模式</p>
              <p className="text-sm text-muted-foreground">
                {preferences.mode === 'light' && '浅色'}
                {preferences.mode === 'dark' && '深色'}
                {preferences.mode === 'system' && '跟随系统'}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>主题颜色</CardTitle>
          <CardDescription>
            选择你喜欢的主题颜色方案
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeColorPicker />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>字体大小</CardTitle>
          <CardDescription>
            调整全局字体大小以提高可读性
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FontSizeControl />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>无障碍功能</CardTitle>
          <CardDescription>
            增强可访问性和可读性
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HighContrastToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>预览</CardTitle>
          <CardDescription>
            查看当前主题设置的效果
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-card border">
            <h3 className="text-lg font-semibold mb-2">示例标题</h3>
            <p className="text-muted-foreground mb-4">
              这是一段示例文本，用于预览当前的主题设置效果。你可以看到字体大小、颜色对比度等设置的实际效果。
            </p>
            <div className="flex gap-2">
              <Button size="sm">主要按钮</Button>
              <Button size="sm" variant="secondary">次要按钮</Button>
              <Button size="sm" variant="outline">轮廓按钮</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
