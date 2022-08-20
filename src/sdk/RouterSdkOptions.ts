import * as Koa from 'koa'
import { WriteLogMiddlewareBuilder } from '@fangcha/logger/lib/koa'
import { RouterApp } from '../main'
import { FangchaSession } from '../session'
import { BasicAuthProtocol, JWTProtocol } from '../basic'

export interface RouterSdkOptions {
  baseURL: string

  backendPort: number
  routerApp: RouterApp
  handleAuth: (ctx: Koa.Context) => Promise<void>
  onRequestError?: (err: Error, ctx: Koa.Context) => void
  customWriteLogMiddlewareBuilder?: WriteLogMiddlewareBuilder
  Session?: typeof FangchaSession & any
  onKoaAppLaunched?: () => void
  serverTimeout?: number

  jwtProtocol?: JWTProtocol
  basicAuthProtocol?: BasicAuthProtocol
}
