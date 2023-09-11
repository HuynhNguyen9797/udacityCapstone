import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getPosts } from '../bussinesLogic/posts'
import { getUserId } from './utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    const todos = await getPosts(userId)
    return {
      statusCode: 200,
      body: JSON.stringify(todos)
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
