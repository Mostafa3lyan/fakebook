import { api } from "./client"
import { ApiError } from "./errors"

interface GraphQLResponseBody<TData> {
  data?: TData
  errors?: Array<{
    message: string
    path?: string[]
    extensions?: Record<string, unknown>
  }>
}

/**
 * Type-safe, lightweight GraphQL fetcher for React Query and Next.js components.
 * Calls the local BFF proxy (/api/backend/graphql) which attaches HttpOnly session cookies
 * and automatically rotates expired tokens.
 *
 * @param query - The GraphQL query or mutation string
 * @param variables - Variables matching the query parameters
 */
export async function gqlRequest<TData = unknown, TVariables = Record<string, unknown>>(
  query: string,
  variables?: TVariables
): Promise<TData> {
  const response = await api<GraphQLResponseBody<TData>>("/graphql", {
    method: "POST",
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  // Check for GraphQL errors array in response payload
  const body = response.data
  if (body?.errors && body.errors.length > 0) {
    const primaryError = body.errors[0]
    throw new ApiError(
      primaryError.message || "GraphQL request failed",
      response.status || 400
    )
  }

  if (!body?.data) {
    throw new ApiError("Empty GraphQL response data received", 500)
  }

  return body.data
}
