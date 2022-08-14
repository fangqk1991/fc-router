import { HealthApis } from '@fangcha/swagger'
import { SpecFactory } from './SpecFactory'

const factory = new SpecFactory('接口基本测试')

factory.prepare(HealthApis.Ping, async (ctx) => {
  ctx.body = 'PONG'
})

factory.prepare(HealthApis.PingAuth, async (ctx) => {
  ctx.body = 'PONG'
})

factory.prepare(HealthApis.PingPrint, async (ctx) => {
  console.info('query: ', JSON.stringify(ctx.request.query, null, 2))
  ctx.body = 'PONG'
})

factory.prepare(HealthApis.PingQuery, async (ctx) => {
  ctx.body = ctx.request.query
})

factory.prepare(HealthApis.PingFullData, async (ctx) => {
  ctx.body = {
    headers: ctx.request.headers,
    query: ctx.request.query,
    bodyData: ctx.request.body,
  }
})

factory.prepare(HealthApis.PingError, async (_ctx) => {
  throw new Error('Ping Error Test')
})

export const HealthSpecs = factory.buildSpecs()
