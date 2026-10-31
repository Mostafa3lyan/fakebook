"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { userService } from "@/services/user.service"

export function useUserSearch(searchQuery: string, limit = 8) {
  const [debouncedQuery, setDebouncedQuery] = React.useState("")

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim())
    }, 300)

    return () => clearTimeout(handler)
  }, [searchQuery])

  const query = useQuery({
    queryKey: ["search-users", debouncedQuery, limit],
    queryFn: async () => {
      const response = await userService.searchUsers({
        search: debouncedQuery,
        page: 1,
        limit,
      })
      return response.data.users
    },
    enabled: debouncedQuery.length > 0,
    staleTime: 1000 * 60, // 1 minute
  })

  // Filter strictly by name (firstName, lastName, or fullName)
  const normalizedQuery = debouncedQuery.toLowerCase()
  const users = React.useMemo(() => {
    const rawUsers = query.data?.data ?? []
    if (!normalizedQuery) return []

    return rawUsers.filter((user) => {
      const firstName = user.firstName?.toLowerCase() ?? ""
      const lastName = user.lastName?.toLowerCase() ?? ""
      const fullName = (
        user.fullName || `${user.firstName} ${user.lastName}`
      )
        .trim()
        .toLowerCase()

      return (
        firstName.includes(normalizedQuery) ||
        lastName.includes(normalizedQuery) ||
        fullName.includes(normalizedQuery)
      )
    })
  }, [query.data?.data, normalizedQuery])

  return {
    users,
    total: users.length,
    debouncedQuery,
    isLoading: query.isLoading && debouncedQuery.length > 0,
    isFetching: query.isFetching,
    isError: query.isError,
  }
}
