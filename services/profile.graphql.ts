import { gqlRequest } from "@/lib/api/graphql"
import { FriendshipStatusType } from "@/lib/types"

export interface GraphQLFriendshipStatus {
  status: FriendshipStatusType
  requestId?: string | null
}

export interface GraphQLPublicUser {
  _id: string
  firstName: string
  lastName: string
  fullName?: string
  profilePicture?: string
  profileCoverPictures?: string[]
  profileVisits?: number
  friendsCount?: number
  friendshipStatus?: GraphQLFriendshipStatus
}

export interface ShareProfileQueryResult {
  shareProfile: GraphQLPublicUser
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
  getPublicProfile: (userId: string) =>
    gqlRequest<ShareProfileQueryResult, { userId: string }>(SHARE_PROFILE_QUERY, {
      userId,
    }),
}

