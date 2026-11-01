/** Image MIME types accepted by the backend (`fileFieldValidation.image`). */
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
] as const

/** Value for an `<input type="file" accept>` attribute. */
export const IMAGE_ACCEPT_ATTRIBUTE = ALLOWED_IMAGE_MIME_TYPES.join(",")

/**
 * Validates an image file client-side before upload.
 * Returns a user-facing error message, or `null` when the file is valid.
 */
export function validateImageFile(file: File, maxSizeMb: number): string | null {
  if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
    return "Please select a valid image (JPEG, PNG, or WebP)."
  }

  if (file.size > maxSizeMb * 1024 * 1024) {
    return `Image file size must be less than ${maxSizeMb} MB.`
  }

  return null
}

