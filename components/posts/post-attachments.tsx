"use client"

import * as React from "react"
import Image from "next/image"
import { ZoomIn, ImageOff } from "lucide-react"
import { resolveMediaUrl } from "@/lib/utils/media"
import { ImageLightbox } from "@/components/shared/image-lightbox"

interface PostAttachmentsProps {
  attachments: string[]
  postTitle?: string
}

export function PostAttachments({ attachments = [], postTitle }: PostAttachmentsProps) {
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null)
  const [failedImages, setFailedImages] = React.useState<Record<number, boolean>>({})

  if (!attachments || attachments.length === 0) return null

  const count = attachments.length
  const displayedImages = attachments.slice(0, 4)
  const remainingCount = count - 4

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }))
  }

  return (
    <>
      {/* Gallery Layouts */}
      <div className="relative overflow-hidden rounded-xl border border-border/40 bg-muted/20">
        {count === 1 && (
          <button
            type="button"
            className="relative block w-full max-h-130 h-85 sm:h-105 cursor-pointer group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setLightboxIndex(0)}
            aria-label={postTitle ? `View ${postTitle}` : "View post attachment"}
          >
            {failedImages[0] ? (
              <div className="flex size-full flex-col items-center justify-center bg-muted/40 text-muted-foreground gap-2">
                <ImageOff className="size-8" />
                <span className="text-xs">Image unavailable</span>
              </div>
            ) : (
              <Image
                src={resolveMediaUrl(attachments[0])}
                alt={postTitle || "Post attachment"}
                fill
                unoptimized
                onError={() => handleImageError(0)}
                className="object-cover group-hover:scale-[1.01] transition-transform duration-200"
                sizes="(max-width: 768px) 100vw, 680px"
                priority={false}
              />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="p-2 rounded-full bg-black/60 text-white">
                <ZoomIn className="size-5" />
              </span>
            </div>
          </button>
        )}

        {count === 2 && (
          <div className="grid grid-cols-2 gap-1 h-65 sm:h-80">
            {attachments.slice(0, 2).map((src, idx) => (
              <button
                key={idx}
                type="button"
                className="relative h-full w-full cursor-pointer group overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setLightboxIndex(idx)}
                aria-label={`View attachment ${idx + 1} of ${count}`}
              >
                {failedImages[idx] ? (
                  <div className="flex size-full flex-col items-center justify-center bg-muted/40 text-muted-foreground gap-2">
                    <ImageOff className="size-6" />
                    <span className="text-xs">Unavailable</span>
                  </div>
                ) : (
                  <Image
                    src={resolveMediaUrl(src)}
                    alt={`Attachment ${idx + 1}`}
                    fill
                    unoptimized
                    onError={() => handleImageError(idx)}
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    sizes="(max-width: 768px) 50vw, 340px"
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {count === 3 && (
          <div className="grid grid-cols-3 gap-1 h-[280px] sm:h-[340px]">
            <button
              type="button"
              className="relative col-span-2 h-full cursor-pointer group overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setLightboxIndex(0)}
              aria-label={`View attachment 1 of ${count}`}
            >
              {failedImages[0] ? (
                <div className="flex size-full flex-col items-center justify-center bg-muted/40 text-muted-foreground gap-2">
                  <ImageOff className="size-6" />
                  <span className="text-xs">Unavailable</span>
                </div>
              ) : (
                <Image
                  src={resolveMediaUrl(attachments[0])}
                  alt="Attachment 1"
                  fill
                  unoptimized
                  onError={() => handleImageError(0)}
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-200"
                  sizes="(max-width: 768px) 66vw, 450px"
                />
              )}
            </button>
            <div className="grid grid-rows-2 gap-1 h-full">
              {attachments.slice(1, 3).map((src, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="relative h-full w-full cursor-pointer group overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => setLightboxIndex(idx + 1)}
                  aria-label={`View attachment ${idx + 2} of ${count}`}
                >
                  {failedImages[idx + 1] ? (
                    <div className="flex size-full flex-col items-center justify-center bg-muted/40 text-muted-foreground gap-2">
                      <ImageOff className="size-5" />
                    </div>
                  ) : (
                    <Image
                      src={resolveMediaUrl(src)}
                      alt={`Attachment ${idx + 2}`}
                      fill
                      unoptimized
                      onError={() => handleImageError(idx + 1)}
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-200"
                      sizes="(max-width: 768px) 33vw, 220px"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {count >= 4 && (
          <div className="grid grid-cols-2 gap-1 h-[300px] sm:h-[360px]">
            {displayedImages.map((src, idx) => {
              const isFourth = idx === 3
              return (
                <button
                  key={idx}
                  type="button"
                  className="relative h-full w-full cursor-pointer group overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => setLightboxIndex(idx)}
                  aria-label={`View attachment ${idx + 1} of ${count}`}
                >
                  {failedImages[idx] ? (
                    <div className="flex size-full flex-col items-center justify-center bg-muted/40 text-muted-foreground gap-2">
                      <ImageOff className="size-6" />
                      <span className="text-xs">Unavailable</span>
                    </div>
                  ) : (
                    <Image
                      src={resolveMediaUrl(src)}
                      alt={`Attachment ${idx + 1}`}
                      fill
                      unoptimized
                      onError={() => handleImageError(idx)}
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-200"
                      sizes="(max-width: 768px) 50vw, 340px"
                    />
                  )}
                  {isFourth && remainingCount > 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl backdrop-blur-xs">
                      +{remainingCount}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Shared Accessible Lightbox Modal */}
      <ImageLightbox
        images={attachments}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
        title={postTitle || "Post attachment"}
      />
    </>
  )
}
