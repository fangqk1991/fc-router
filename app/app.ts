import { FangchaApp } from '@fangcha/backend-kit'
import { AppRouterPlugin } from './AppRouterPlugin'

const app = new FangchaApp({
  env: 'development',
  appName: 'datawich-admin',
  plugins: [AppRouterPlugin],
})
app.launch()
