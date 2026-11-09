import { gqlRequest } from "@/lib/api/graphql"
import { postService } from "./post.service"
import { IPost, PaginatedResult } from "@/lib/types"

export const POST_FRAGMENT = `
  _id
  content
  attachments
  visibility
  reactionsCount
  reactionsBreakdown {
    like
    love
    care
    haha
    wow
    sad
    angry
  }
  reactions {
    reactionType
    createdBy
    createdAt
  }
  commentsCount
  shareCount
  isEdited
  createdAt
  updatedAt
  location {
    name
    lat
    lng
  }
  createdBy {
    _id
    firstName
    lastName
    fullName
    profilePicture
  }
  tags {
    _id
    firstName
    lastName
    fullName
    profilePicture
  }
  sharedFrom {
    isOriginalDeleted
    originalAuthorId {
      _id
      firstName
      lastName
      fullName
      profilePicture
    }
    originalPostId {
      _id
      content
      attachments
      createdAt
      createdBy {
        _id
        firstName
        lastName
        fullName
        profilePicture
      }
    }
  }
`

export const FEED_POSTS_QUERY = `
  query GetFeedPosts($page: Int, $limit: Int, $search: String) {
    posts(page: $page, limit: $limit, search: $search) {
      data {
        ${POST_FRAGMENT}
      }
      total
      page
      limit
      totalPages
      hasNextPage
      hasPrevPage
    }
  }
`

export const GET_POST_BY_ID_QUERY = `
  query GetPostById($postId: ID!) {
    post(postId: $postId) {
      ${POST_FRAGMENT}
    }
  }
`

interface FeedPostsResponse {
  posts: PaginatedResult<IPost>
}

interface PostByIdResponse {
  post: IPost
}

export const postGraphQLService = {
  getPosts: async (params: { page?: number; limit?: number; search?: string } = {}): Promise<{ posts: PaginatedResult<IPost> }> => {
    try {
      const data = await gqlRequest<FeedPostsResponse, { page?: number; limit?: number; search?: string }>(
        FEED_POSTS_QUERY,
        {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          search: params.search || undefined,
        }
      )
      if (data?.posts?.data) {
        return { posts: data.posts }
      }
    } catch (err) {
      console.warn("[GraphQL] posts query failed, falling back to REST:", err)
    }

    const restRes = await postService.getPosts(params)
    return restRes.data
  },

  getPostById: async (postId: string): Promise<{ post: IPost }> => {
    try {
      const data = await gqlRequest<PostByIdResponse, { postId: string }>(GET_POST_BY_ID_QUERY, {
        postId,
      })
      if (data?.post) {
        return { post: data.post }
      }
    } catch (err) {
      console.warn("[GraphQL] post query failed, falling back to REST:", err)
    }

    const restRes = await postService.getPostById(postId)
    return restRes.data
  },
}

