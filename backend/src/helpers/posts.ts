import { PostAccess } from './postsAcess'
import { CreatePostRequest } from '../requests/CreatePostRequest'
import { UpdatePostRequest } from '../requests/UpdatePostRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { PostItem } from '../models/Post/post.model'

const logger = createLogger('PostAccess')
const postAccess = new PostAccess()

export const createPost = async (
  userId: string,
  request: CreatePostRequest
) => {
  const postId = uuid.v4()
  logger.info('Business layer, create a new post')

  logger.info(request)

  return await postAccess.createPost({
    user_id: userId,
    post_id: postId,
    post_title: request.post_title,
    post_content: request.post_content,
    created_at: new Date().toISOString(),
    modified_at: null,
    attachmentUrl: null
  })
}

export const uploadImage = async (userId: string, postId: string) => {
  const attachmentId = uuid.v4()
  return await postAccess.saveImgUrlAndGenUploadUrl(
    userId,
    postId,
    attachmentId
  )
}

export const getPosts = async (userId: string): Promise<PostItem[]> => {
  return await postAccess.getPosts(userId)
}

export const getPost = async (
  userId: string,
  postId: string
): Promise<PostItem> => {
  return await postAccess.getPost(userId, postId)
}

export const updatePost = async (
  userId: string,
  postId: string,
  request: UpdatePostRequest
) => {
  await postAccess.updatePost(userId, postId, {
    post_title: request.post_title,
    post_content: request.post_content,
    modified_at: new Date().toISOString()
  })
}

export const deletePost = async (userId: string, postId: string) => {
  await postAccess.deletePost(userId, postId)
}
