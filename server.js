import express from 'express'
import next from 'next'
import Passport from 'passport'
import BodyParser from 'body-parser'
import { parse } from 'url'
import passportConfig from './config/passport'
import getPageRoutes from './pageRoutes'
import apiRoutes from './apiRoutes'

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const pageRoutes = getPageRoutes()

app.prepare()
.then(() => {
  const server = express()
  server.use( BodyParser.urlencoded( { extended: false } ) )
  server.use( BodyParser.json() )
  server.use( Passport.initialize() )

  passportConfig(Passport)
  apiRoutes.forEach(({method, path, middleware, callback}) => {
    server[method](path, middleware, callback)
  })

  server.get('*', (req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl
    const route = pageRoutes[pathname]

    if (route) {
      return app.render(req, res, route.page, route.query)
    }

    return handle(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
