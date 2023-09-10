import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getPost } from '../../helpers/posts'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    const postId = event.pathParameters.postId
    const post = await getPost(userId, postId)
    return {
      statusCode: 200,
      body: JSON.stringify(post)
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
