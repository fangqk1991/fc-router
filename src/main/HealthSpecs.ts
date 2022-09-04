import { SpecFactory } from './SpecFactory'
import { RetainedHealthApis } from '../apis'

const factory = new SpecFactory('接口基本测试')

factory.prepare(RetainedHealthApis.Ping, async (ctx) => {
  ctx.body = 'PONG'
})

factory.prepare(RetainedHealthApis.PingAuth, async (ctx) => {
  ctx.body = 'PONG'
})

factory.prepare(RetainedHealthApis.PingPrint, async (ctx) => {
  console.info('query: ', JSON.stringify(ctx.request.query, null, 2))
  ctx.body = 'PONG'
})

factory.prepare(RetainedHealthApis.PingQuery, async (ctx) => {
  ctx.body = ctx.request.query
})

factory.prepare(RetainedHealthApis.PingFullData, async (ctx) => {
  ctx.body = {
    headers: ctx.request.headers,
    query: ctx.request.query,
    bodyData: ctx.request.body,
  }
})

factory.prepare(RetainedHealthApis.PingError, async (_ctx) => {
  throw new Error('Ping Error Test')
})

export const HealthSpecs = factory.buildSpecs()
