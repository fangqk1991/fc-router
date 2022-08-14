import { AppPluginProtocol } from '@fangcha/backend-kit/lib/basic'
import * as Koa from 'koa'
import { Context } from 'koa'
import { RouterSdkOptions } from './RouterSdkOptions'
import { WriteLogMiddlewareBuilder } from '@fangcha/logger/lib/koa'
import { FangchaAdminSession } from '@fangcha/backend-kit'
import AppError from '@fangcha/app-error'

const compose = require('koa-compose')
const bodyParser = require('koa-body')

export const RouterSdkPlugin = (options: RouterSdkOptions): AppPluginProtocol => {
  return {
    appDidLoad: (app) => {
      const koaApp = new Koa()
      if (options.onRequestError) {
        koaApp.on('error', options.onRequestError)
      }

      const routerApp = options.routerApp

      for (const plugin of app.plugins) {
        if (plugin.specDocItem) {
          options.routerApp.addDocItem(plugin.specDocItem)
        }
      }

      const codeVersion = process.env.CODE_VERSION || 'Unknown'
      const writeLogMiddlewareBuilder = options.customWriteLogMiddlewareBuilder || new WriteLogMiddlewareBuilder()

      const sessionClazz = options.Session || FangchaAdminSession
      koaApp.use(
        compose([
          async (ctx: Context, next: Function) => {
            ctx.set('x-code-version', codeVersion)
            ctx.session = new sessionClazz(ctx)
            ctx.logger = ctx.session.logger
            await next()
          },

          writeLogMiddlewareBuilder.build(),

          async (ctx: Context, next: Function) => {
            const parser = bodyParser({ multipart: true })
            try {
              await parser(ctx, () => {})
            } catch (e) {
              console.error(e)
              throw new AppError(`JSON parse error. ${(e as Error).message}`, 400)
            }
            await next()
          },

          ...routerApp.getPreHandleMiddlewares(),

          // 暴露公开 api
          routerApp.makePublicRouterMiddleware(),

          // 访问鉴权
          async (ctx: Context, next: Function) => {
            await options.handleAuth(ctx)
            await next()
          },

          // 添加需要 auth 的 api
          routerApp.makePrivateRouterMiddleware(),
        ])
      )

      const server = koaApp.listen(options.backendPort, () => {
        if (options.onKoaAppLaunched) {
          options.onKoaAppLaunched()
        }
      })
      if (options.serverTimeout) {
        server.setTimeout(options.serverTimeout)
      }
    },
  }
}
