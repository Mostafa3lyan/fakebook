"use client"

import * as React from "react"
import Image from "next/image"
import { ZoomIn } from "lucide-react"
import { resolveMediaUrl } from "@/lib/utils/media"
import { ImageLightbox } from "@/components/shared/image-lightbox"
import { cn } from "@/lib/utils"

interface CommentAttachmentsProps {
  attachments: string[]
  className?: string
}

export function CommentAttachments({
  attachments = [],
  className,
}: CommentAttachmentsProps) {
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null)

  if (!attachments || attachments.length === 0) return null

  return (
    <>
      <div className={cn("flex items-center gap-2 pt-1.5 flex-wrap", className)}>
        {attachments.map((key, idx) => {
          const url = resolveMediaUrl(key)
          return (
            <button
              key={key || idx}
              type="button"
              onClick={() => setLightboxIndex(idx)}
              aria-label={`View comment photo ${idx + 1}`}
              className="relative size-20 sm:size-24 rounded-lg overflow-hidden border border-border/80 bg-background cursor-pointer group shadow-2xs hover:border-primary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Image
                src={url}
                alt={`Comment photo ${idx + 1}`}
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="p-1 rounded-full bg-black/60 text-white">
                  <ZoomIn className="size-3.5" />
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Shared Accessible Lightbox Modal */}
      <ImageLightbox
        images={attachments}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
        title="Comment photo"
      />
    </>
  )
}
