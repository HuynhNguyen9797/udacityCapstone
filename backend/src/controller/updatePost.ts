import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updatePost } from '../bussinesLogic/posts'
import { UpdatePostRequest } from '../requests/UpdatePostRequest'
import { getUserId } from './utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const postId = event.pathParameters.postId
    const updatedPost: UpdatePostRequest = JSON.parse(event.body)
    const userId = getUserId(event)

    await updatePost(userId, postId, updatedPost)

    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
