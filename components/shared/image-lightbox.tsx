"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { resolveMediaUrl } from "@/lib/utils/media"

interface ImageLightboxProps {
  images: string[]
  activeIndex: number | null
  onClose: () => void
  onChangeIndex: (index: number) => void
  title?: string
}

export function ImageLightbox({
  images,
  activeIndex,
  onClose,
  onChangeIndex,
  title = "Image preview",
}: ImageLightboxProps) {
  const count = images.length
  const isOpen = activeIndex !== null && count > 0

  const nextImage = React.useCallback(() => {
    if (activeIndex !== null && count > 1) {
      onChangeIndex((activeIndex + 1) % count)
    }
  }, [activeIndex, count, onChangeIndex])

  const prevImage = React.useCallback(() => {
    if (activeIndex !== null && count > 1) {
      onChangeIndex((activeIndex - 1 + count) % count)
    }
  }, [activeIndex, count, onChangeIndex])

  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault()
        nextImage()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        prevImage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, nextImage, prevImage])

  if (!isOpen || activeIndex === null) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-none w-screen h-screen p-0 border-none bg-black/90 backdrop-blur-md shadow-none flex items-center justify-center sm:max-w-none rounded-none"
      >
        <DialogTitle className="sr-only">
          {title} ({activeIndex + 1} of {count})
        </DialogTitle>

        {/* Close button */}
        <button
          type="button"
          className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer min-h-11 min-w-11 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          onClick={onClose}
          aria-label="Close image preview"
        >
          <X className="size-6" />
        </button>

        {/* Left Arrow */}
        {count > 1 && (
          <button
            type="button"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer min-h-11 min-w-11 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
            aria-label="Previous image"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}

        {/* Right Arrow */}
        {count > 1 && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer min-h-11 min-w-11 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
            aria-label="Next image"
          >
            <ChevronRight className="size-6" />
          </button>
        )}

        {/* Active Image */}
        <div
          className="relative max-w-4xl max-h-[85vh] w-[90vw] h-[75vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={resolveMediaUrl(images[activeIndex])}
            alt={`${title} ${activeIndex + 1}`}
            fill
            unoptimized
            className="object-contain"
            sizes="90vw"
            priority
          />
        </div>

        {/* Image index indicator */}
        {count > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white/90 text-xs font-semibold">
            {activeIndex + 1} / {count}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

