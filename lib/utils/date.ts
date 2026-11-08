/**
 * Format a date string or Date object into a compact relative time representation
 * commonly used in social feeds and comment sections (e.g., "Just now", "5m", "2h", "3d", "Oct 25").
 */
export function formatRelativeTime(dateInput?: string | Date | null): string {
  if (!dateInput) return "Recently"

  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    if (isNaN(date.getTime())) return "Recently"

    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 0 || diffInSeconds < 60) return "Just now"
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d`

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  } catch {
    return "Recently"
  }
}

export const formatTimeAgo = formatRelativeTime

/**
 * Format a date string or Date object into clock time (e.g., "10:30 AM").
 */
export function formatTime(dateInput?: string | Date | null): string {
  if (!dateInput) return ""

  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    if (isNaN(date.getTime())) return ""

    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } catch {
    return ""
  }
}

/**
 * Format a date string or Date object into Month Day, Year (e.g., "October 25, 2026").
 */
export function formatFullDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "Not provided"

  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    if (isNaN(date.getTime())) return "Not provided"

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return "Not provided"
  }
}

/**
 * Format a date string or Date object into Month Year (e.g., "October 2026").
 */
export function formatMonthYear(dateInput?: string | Date | null): string {
  if (!dateInput) return "Recently"

  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    if (isNaN(date.getTime())) return "Recently"

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    })
  } catch {
    return "Recently"
  }
}
