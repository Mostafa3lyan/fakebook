"use client"

import * as React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { resolveMediaUrl } from "@/lib/utils/media"
import { ImageLightbox } from "@/components/shared/image-lightbox"

interface ProfileCoverBannerProps {
  /** S3 key or URL of the cover image; falls back to the brand gradient when empty. */
  coverImage?: string
  ownerName: string
  className?: string
  /** Overlay controls (e.g. the owner's "Edit cover photo" menu). */
  children?: React.ReactNode | ((helpers: { openLightbox: () => void }) => React.ReactNode)
}

export function ProfileCoverBanner({
  coverImage,
  ownerName,
  className,
  children,
}: ProfileCoverBannerProps) {
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null)
  const coverSrc = resolveMediaUrl(coverImage)

  const openLightbox = React.useCallback(() => {
    if (coverImage) setLightboxIndex(0)
  }, [coverImage])

  const renderedChildren =
    typeof children === "function" ? children({ openLightbox }) : children

  return (
    <div
      className={cn(
        "relative h-32 sm:h-44 overflow-hidden bg-linear-to-r from-blue-500 via-blue-500 to-blue-600",
        className,
      )}
    >
      {coverSrc && (
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="absolute inset-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          aria-label={`View ${ownerName}'s cover photo`}
        >
          <Image
            src={coverSrc}
            alt={`${ownerName}'s cover photo`}
            fill
            unoptimized
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </button>
      )}

      {renderedChildren && <div className="absolute bottom-3 right-3 z-10">{renderedChildren}</div>}

      {coverImage && (
        <ImageLightbox
          images={[coverImage]}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={setLightboxIndex}
          title={`${ownerName}'s cover photo`}
        />
      )}
    </div>
  )
}

