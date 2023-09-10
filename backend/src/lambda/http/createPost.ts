import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreatePostRequest } from '../../requests/CreatePostRequest'
import { getUserId } from '../utils'
import { createPost } from '../../helpers/posts'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newPost: CreatePostRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const post = await createPost(userId, newPost)
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(post)
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
