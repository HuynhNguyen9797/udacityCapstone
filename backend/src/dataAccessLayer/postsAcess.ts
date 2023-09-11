import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { PostItem } from '../models/Post/post.model'
import { PostUpdate } from '../models/Post/post-update.model'
import { AttachmentUtils } from '../fileStorage/attachmentUtils'

const XAWS = AWSXRay.captureAWS(AWS)

export class PostAccess {
  private readonly postClient: DocumentClient =
    new XAWS.DynamoDB.DocumentClient()
  private readonly postsTable = process.env.POSTS_TABLE
  private readonly postsCreatedAtIndex: string =
    process.env.POSTS_CREATED_AT_INDEX
  private readonly bucketName: string = process.env.S3_BUCKET
  private readonly attachmentUtil: AttachmentUtils = new AttachmentUtils()
  private readonly logger
  constructor() {
    this.logger = createLogger('postAccess')
  }

  public async saveImgUrlAndGenUploadUrl(
    userId: string,
    postId: string,
    attachmentId: string
  ): Promise<any> {
    const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`

    await this.postClient
      .update({
        TableName: this.postsTable,
        Key: {
          post_id: postId,
          user_id: userId
        },
        UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
        ExpressionAttributeNames: {
          '#attachmentUrl': 'attachmentUrl'
        },
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      })
      .promise()
    const imgPutUrl = await this.attachmentUtil.getSignedUrl(attachmentId)
    return {imgPutUrl, attachmentUrl}
  }

  public async createPost(post: PostItem): Promise<PostItem> {
    this.logger.info(
      'posts Data access layer for creating a new post: ready to create'
    )
    await this.postClient
      .put({
        TableName: this.postsTable,
        Item: post
      })
      .promise()

    return post
  }

  public async getPosts(userId: string): Promise<PostItem[]> {
    this.logger.info(
      'Posts Data access layer for getting all posts: ready to get'
    )

    const result = await this.postClient
      .query({
        TableName: this.postsTable,
        IndexName: this.postsCreatedAtIndex,
        KeyConditionExpression: '#user_id = :user_id',
        ExpressionAttributeNames: {
          '#user_id': 'user_id'
        },
        ExpressionAttributeValues: {
          ':user_id': userId
        }
      })
      .promise()

    this.logger.info('Getting all posts successfully: ', result.Items)

    return result.Items as PostItem[]
  }

  public async getPost(user_id: string, post_id: string): Promise<PostItem> {
    this.logger.info(
      `Get post with id ${post_id}`
    )

    const result = await this.postClient
      .get({
        TableName: this.postsTable,
        Key: { user_id, post_id }
      })
      .promise()

    this.logger.info('Getting all posts successfully: ', result.Item)
    return result.Item as PostItem
  }

  public async updatePost(userId: string, postId: string, post: PostUpdate) {
    this.logger.info(`Updating a post with ${postId} and update body ${post}`)
    await this.postClient
      .update({
        TableName: this.postsTable,
        Key: { user_id: userId, post_id: postId },
        UpdateExpression:
          'set #post_title = :title, #post_content = :content, #modified_at = :modified_at',
        ExpressionAttributeNames: {
          '#post_title': 'post_title',
          '#post_content': 'post_content',
          '#modified_at': 'modified_at'
        },
        ExpressionAttributeValues: {
          ':title': post.post_title,
          ':content': post.post_content,
          ':modified_at': post.modified_at
        }
      })
      .promise()
  }

  public async deletePost(user_id: string, post_id: string) {
    this.logger.info(`Delete post with id ${ post_id}`)
    await this.postClient
      .delete({
        TableName: this.postsTable,
        Key: { user_id, post_id }
      })
      .promise()
      .then(() => this.logger.info(`Post ${ post_id} is deleted successfully`))
      .catch((error) =>
        this.logger.info(`Post ${ post_id} is deleted with error: ${error}`)
      )
  }
}
