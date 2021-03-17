const router = require('koa-router')()
const crypto = require("crypto")
const jwt = require('../jwt')
const user = require('../model/user/index')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/register', async (ctx, next) => {
  const value = await user.register({
    username: 'zzz1',
    password: crypto.createHash('md5').update('123456').digest('hex'),
    avatar_url: 's',
    gender: 1,
    mobile_number: '123213'
  })
  ctx.body = value
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

router.get('/login', async (ctx, next) => {
  await jwt.login(ctx)
})

module.exports = router
