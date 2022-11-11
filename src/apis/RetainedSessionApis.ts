import { Api } from '@fangcha/swagger'

export const RetainedSessionApis = {
  SessionInfoGet: {
    method: 'GET',
    route: '/api/session/v1/session-info',
    description: '获取当前会话信息',
    skipAuth: true,
  } as Api,
  UserInfoGet: {
    method: 'GET',
    route: '/api/session/v1/user-info',
    description: '获取当前用户信息',
  } as Api,
}
