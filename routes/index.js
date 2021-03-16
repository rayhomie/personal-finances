const router = require('koa-router')()

const jwt = require('../jwt')

const user = require('../model/user/index')
router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  const value = await user.find({})
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
