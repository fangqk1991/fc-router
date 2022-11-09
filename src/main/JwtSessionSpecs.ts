import { SpecFactory } from './SpecFactory'
import { RetainedSessionApis } from '../apis'
import { FangchaJwtSession } from '../session'
import { SessionInfo } from '../models'

const factory = new SpecFactory('接口基本测试')

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
