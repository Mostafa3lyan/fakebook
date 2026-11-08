export interface ApiResponse<T = void> {
  message: string
  status: number
  data: T
}

export interface ApiIssue {
  message: string
  path: (string | number)[]
}

export interface ApiValidationErrorGroup {
  key: "body" | "query" | "params" | "headers" | "file" | "files"
  issues: ApiIssue[]
}

export interface ApiErrorCause {
  error?: ApiValidationErrorGroup[]
  code?: string
  field?: string
  extensions?: Record<string, unknown>
  details?: unknown
}

export interface ApiErrorResponse {
  status: number
  message: string
  cause?: ApiErrorCause
  stack?: string
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page?: number
  limit?: number
  totalPages?: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export type IPagination<T> = PaginatedResult<T>

