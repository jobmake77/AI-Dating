'use client'

import { useState, useCallback } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ZoomIn, ZoomOut } from 'lucide-react'

interface ImageCropperProps {
  image: string
  onCropComplete: (croppedImage: Blob) => void
  onCancel: () => void
  aspect?: number
  shape?: 'rect' | 'round'
}

export function ImageCropper({
  image,
  onCropComplete,
  onCancel,
  aspect = 1,
  shape = 'rect',
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropChange = useCallback((crop: Point) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return

    setIsProcessing(true)

    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels)
      onCropComplete(croppedImage)
    } catch (error) {
      console.error('Failed to crop image:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>裁剪图片</DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-96 bg-muted">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={shape}
            showGrid={true}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            拖动图片调整位置，滑动缩放图片
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            取消
          </Button>
          <Button onClick={createCroppedImage} disabled={isProcessing}>
            {isProcessing ? '处理中...' : '确认裁剪'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to create cropped image
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to create blob'))
      }
    }, 'image/jpeg', 0.95)
  })
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
}
