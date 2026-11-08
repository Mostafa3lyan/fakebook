"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { userService } from "@/services/user.service"
import { IUser } from "@/lib/types"

import { ApiError } from "@/lib/api/errors"

const emptySubscribe = () => () => {}

export function useCurrentUser() {
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const query = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const response = await userService.getProfile()
      return response.data.profile
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: ApiError | Error) => {
      if ("status" in error && (error.status === 401 || error.status === 403)) return false
      return failureCount < 2
    },
  })

  return {
    user: isMounted ? (query.data as IUser | undefined) : undefined,
    isLoading: !isMounted || query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
