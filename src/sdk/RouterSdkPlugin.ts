import { AppPluginProtocol } from '@fangcha/backend-kit/lib/basic'
import * as Koa from 'koa'
import { Context } from 'koa'
import { RouterSdkOptions } from './RouterSdkOptions'
import { WriteLogMiddlewareBuilder } from '@fangcha/logger/lib/koa'
import { _FangchaState } from '@fangcha/backend-kit'
import AppError from '@fangcha/app-error'
import { logger } from '@fangcha/logger'
import { FangchaAdminSession, FangchaSession } from '../session'

const compose = require('koa-compose')
const bodyParser = require('koa-body')

export const RouterSdkPlugin = (options: RouterSdkOptions): AppPluginProtocol => {
  return {
    appDidLoad: (app) => {
      const koaApp = new Koa()

      const onRequestError =
        options.onRequestError ||
        ((err, ctx: Koa.Context) => {
          if (ctx.status >= 500) {
            const session = ctx.session as FangchaSession
            _FangchaState.botProxy.notifyApiError({
              api: ctx.path || '',
              errorMsg: err.message,
              method: (ctx.method || '').toUpperCase(),
              statusCode: ctx.status,
              user: session.curUserStr(),
              ipAddress: session.realIP,
              duration: ctx.duration,
              reqid: session.reqid || '-',
              referer: ctx.headers.referer || '-',
            })
          }
        })
      koaApp.on('error', onRequestError)

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

          async (ctx: Context, next: Function) => {
            await options.handleAuth(ctx)
            await next()
          },

          routerApp.makePrivateRouterMiddleware(),
        ])
      )

      const onKoaAppLaunched =
        options.onKoaAppLaunched ||
        (() => {
          _FangchaState.botProxy.notify(`[${_FangchaState.tags.join(', ')}] App launched.`)
          logger.info(`[${_FangchaState.env}] Backend service listening on port ${options.backendPort}!`)
        })

      const server = koaApp.listen(options.backendPort, () => {
        onKoaAppLaunched()
      })
      if (options.serverTimeout) {
        server.setTimeout(options.serverTimeout)
      }
    },
  }
}
