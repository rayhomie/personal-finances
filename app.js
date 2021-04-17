const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
// const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const koaBody = require('koa-body');
const logger = require('koa-logger')
const jwtKoa = require('koa-jwt')
const secret = require('./secret.json');
const VTM = require('./verify-token-middleware')

const index = require('./src/routes/index')

// error handler
// onerror(app)

// middlewares

app.use(koaBody({
  multipart: true, formidable: {
    // maxFieldsSize: 10 * 1024 * 1024,
    multipart: true
  }
}))

// app.use(bodyparser({
//   enableTypes: ['json', 'form', 'text']
// }))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// 验证请求header中的token是否有效
app.use(VTM())

// 除去一些没必要通过jwt验证
app.use(jwtKoa({ secret: secret.sign }).unless({
  path: [/^\/api\/login/, /^\/api\/register/, /^\/api\/upload\/picture/]
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
