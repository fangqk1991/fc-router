import { RouterApp } from '../src'
import { RouterSdkPlugin } from '../src/sdk'

const config = {
  backendPort: 6130,
  baseURL: 'http://127.0.0.1:6130',
}

const routerApp = new RouterApp({
  baseURL: config.baseURL,
  useHealthSpecs: true,
  docItems: [],
})

export const AppRouterPlugin = RouterSdkPlugin({
  baseURL: config.baseURL,
  basicAuthProtocol: {
    findVisitor: (username: string, password: string) => {
      return {
        visitorId: username,
        name: username,
        secrets: [password],
        permissionKeys: [],
        isEnabled: true,
      }
    },
  },
  backendPort: config.backendPort,
  routerApp: routerApp,
})
