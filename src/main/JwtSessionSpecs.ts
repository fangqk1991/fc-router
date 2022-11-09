import { SpecFactory } from './SpecFactory'
import { RetainedSessionApis } from '../apis'
import { FangchaJwtSession } from '../session'
import { SessionInfo } from '../models'
import { SwaggerDocItem } from './SwaggerDocItem'

const factory = new SpecFactory('Session')

factory.prepare(RetainedSessionApis.SessionInfoGet, async (ctx) => {
  const session = ctx.session as FangchaJwtSession
  const data = {
    userInfo: null,
  } as SessionInfo
  if (session.checkLogin()) {
    data.userInfo = session.getAuthInfo()
  }
  ctx.body = data
})

export const JwtSessionSpecs = factory.buildSpecs()

export const JwtSessionSpecDocItem: SwaggerDocItem = {
  name: 'Session',
  pageURL: '/api-docs/v1/session-sdk',
  specs: JwtSessionSpecs,
}
