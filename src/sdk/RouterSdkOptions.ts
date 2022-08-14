import * as Koa from 'koa'
import { WriteLogMiddlewareBuilder } from '@fangcha/logger/lib/koa'
import { FangchaSession } from '@fangcha/backend-kit'
import { RouterApp } from '../main'
import { AppPluginProtocol } from '@fangcha/backend-kit/lib/basic'

export interface RouterSdkOptions {
  backendPort: number
  routerApp: RouterApp
  handleAuth: (ctx: Koa.Context) => Promise<void>
  onPluginsCreated?: (plugins: AppPluginProtocol[]) => void
  onRequestError?: (err: Error, ctx: Koa.Context) => void
  customWriteLogMiddlewareBuilder?: WriteLogMiddlewareBuilder
  Session?: typeof FangchaSession & any
  onKoaAppLaunched?: () => void
  serverTimeout?: number
}
