import { gqlRequest } from "@/lib/api/graphql"
import { userService } from "./user.service"
import { FriendshipStatusType, IPublicUser } from "@/lib/types"

export interface GraphQLFriendshipStatus {
  status: FriendshipStatusType
  requestId?: string | null
}

export interface ShareProfileQueryResult {
  shareProfile: IPublicUser
}

export const SHARE_PROFILE_QUERY = `
  query GetShareProfile($userId: ID!) {
    shareProfile(userId: $userId) {
      _id
      firstName
      lastName
      fullName
      profilePicture
      profileCoverPictures
      profileVisits
      friendsCount
      friendshipStatus {
        status
        requestId
      }
    }
  }
`

export const profileGraphQLService = {
  getPublicProfile: async (userId: string): Promise<IPublicUser> => {
    try {
      const data = await gqlRequest<ShareProfileQueryResult, { userId: string }>(
        SHARE_PROFILE_QUERY,
        { userId }
      )
      if (data?.shareProfile) {
        return data.shareProfile
      }
    } catch (err) {
      console.warn("[GraphQL] shareProfile query failed, falling back to REST:", err)
    }

    // Resilient fallback to REST so the UI never crashes or shows a false "Profile Not Found"
    const restRes = await userService.shareProfile(userId)
    return restRes.data.account
  },
}

