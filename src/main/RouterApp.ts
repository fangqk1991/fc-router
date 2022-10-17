import * as Router from 'koa-joi-router'
import { Spec } from 'koa-joi-router'
import * as Koa from 'koa'
import { SwaggerDocItem } from './SwaggerDocItem'
import { SwaggerBuilder } from './SwaggerBuilder'
import { HealthSpecs } from './HealthSpecs'

export interface RouterAppParams {
  baseURL: string
  version?: string
  description?: string
  useBasicAuth?: boolean
  docItems: SwaggerDocItem[]
  swaggerResource?: SwaggerResource
  useHealthSpecs?: boolean
}

export interface SwaggerResource {
  cssMain: string
  jsBundle: string
  jsPreset: string
}

const _defaultPrivateSpecCheck = (spec: Spec) => {
  return !spec['skipAuth']
}

export class RouterApp {
  public static defaultSwaggerResource: SwaggerResource = {
    cssMain: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.6.1/swagger-ui.min.css',
    jsBundle: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.6.1/swagger-ui-bundle.js',
    jsPreset: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.6.1/swagger-ui-standalone-preset.js',
  }

  private readonly params: RouterAppParams

  constructor(params: RouterAppParams) {
    this.params = params
    if (params.useHealthSpecs) {
      this.params.docItems.push({
        name: '健康检查',
        pageURL: '/api-docs/v1/health',
        specs: HealthSpecs,
      })
    }
  }

  public addDocItem(...docItems: SwaggerDocItem[]) {
    for (const docItem of docItems) {
      this.params.docItems.push(docItem)
    }
    return this
  }

  private _preHandleMiddlewares: Koa.Middleware[] = []
  public addPreHandleMiddleware(middleware: Koa.Middleware) {
    this._preHandleMiddlewares.push(middleware)
    return this
  }

  public getPreHandleMiddlewares() {
    return this._preHandleMiddlewares
  }

  public makePrivateRouterMiddleware() {
    const privateSpecs = this.params.docItems.reduce((prev: Spec[], cur) => {
      const privateSpecCheck = cur.privateSpecCheck || _defaultPrivateSpecCheck
      return prev.concat(cur.specs.filter((spec) => privateSpecCheck(spec)))
    }, [])
    const router = Router()
    router.route(privateSpecs)
    return router.middleware()
  }

  public makePublicRouterMiddleware() {
    const publicSpecs = this.params.docItems.reduce((prev: Spec[], cur) => {
      const privateSpecCheck = cur.privateSpecCheck || _defaultPrivateSpecCheck
      return prev.concat(cur.specs.filter((spec) => !privateSpecCheck(spec)))
    }, [])
    const router = this.makeSwaggerRouter()
    router.route(publicSpecs)
    return router.middleware()
  }

  private makeSwaggerRouter() {
    const swaggerResource = this.params.swaggerResource || RouterApp.defaultSwaggerResource
    const myRouter = Router()
    this.params.docItems.forEach((item) => {
      myRouter.get(item.pageURL, async (ctx) => {
        ctx.body = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="${swaggerResource.cssMain}" />
    <style>
      html
      {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }

      *,
      *:before,
      *:after
      {
        box-sizing: inherit;
      }

      body
      {
        margin:0;
        background: #fafafa;
      }
    </style>
  </head>

  <body>
    <div id="swagger-ui"></div>
    <script src="${swaggerResource.jsBundle}" charset="UTF-8"> </script>
    <script src="${swaggerResource.jsPreset}" charset="UTF-8"> </script>
    <script>
    window.onload = function() {
      // Begin Swagger UI call region
      const ui = SwaggerUIBundle({
        "dom_id": "#swagger-ui",
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        queryConfigEnabled: true,
        validatorUrl: "https://validator.swagger.io/validator",
        url: "${item.pageURL}/swagger.json",
      })
      window.ui = ui;
    };
  </script>
  </body>
</html>
`
      })
      myRouter.get(`${item.pageURL}/swagger.json`, async (ctx) => {
        const swagger = new SwaggerBuilder({
          title: item.name,
          description: item.description || this.params.description || '',
          version: item.version || this.params.version || '1.0.0',
          baseURL: this.params.baseURL,
        })
        if (this.params.useBasicAuth) {
          swagger.useBasicAuth()
        }
        swagger.addSpec(...item.specs)
        if (item.models) {
          swagger.addModel(...item.models)
        }
        ctx.body = swagger.buildContent()
      })
    })
    return myRouter
  }
}
