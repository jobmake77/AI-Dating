/**
 * 动态导入配置
 * 用于代码分割和懒加载
 */

import dynamic from 'next/dynamic'

// 编辑器组件（大型组件，懒加载）
export const TiptapEditor = dynamic(
  () => import('@/components/editor/tiptap-editor').then(mod => ({ default: mod.TiptapEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center bg-muted rounded-md">
        <p className="text-muted-foreground">加载编辑器...</p>
      </div>
    ),
  }
)

// Emoji 选择器（大型组件，懒加载）
export const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
  loading: () => (
    <div className="w-[350px] h-[400px] flex items-center justify-center bg-muted rounded-md">
      <p className="text-muted-foreground">加载表情...</p>
    </div>
  ),
})

// 图表组件（未安装 recharts，暂时注释）
// export const Chart = dynamic(() => import('recharts').then(mod => mod.LineChart), {
//   ssr: false,
//   loading: () => (
//     <div className="w-full h-64 flex items-center justify-center bg-muted rounded-md">
//       <p className="text-muted-foreground">加载图表...</p>
//     </div>
//   ),
// })

// Markdown 预览（如果使用）
export const MarkdownPreview = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-32 flex items-center justify-center bg-muted rounded-md">
      <p className="text-muted-foreground">加载预览...</p>
    </div>
  ),
})

// 图片裁剪器（大型组件，懒加载）
export const ImageCropper = dynamic(
  () => import('@/components/ui/image-cropper').then(mod => ({ default: mod.ImageCropper })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <p className="text-muted-foreground">加载裁剪工具...</p>
      </div>
    ),
  }
)
