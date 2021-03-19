const router = require('koa-router')()
const jwt = require('../../jwt')
const crypto = require("crypto")
const user = require('../../model/user/index')
const userRouter = require('./user/index')
const billCategoryRouter = require('./bill_category/index')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

// 登录
router.post('/login', async (ctx, next) => {
  await jwt.login(ctx)
})

// 注册
router.post('/register', async (ctx, next) => {
  const { password, ...rest } = ctx.request.body
  const value = await user.register(password ? {
    // username: 'zzz1',
    // password: crypto.createHash('md5').update('123456').digest('hex'),
    // avatar_url: 's',
    // gender: 1,
    // mobile_number: '123213'
    password: crypto.createHash('md5').update('123456').digest('hex'),
    ...rest
  } : rest)
  ctx.body = value
})

router.use('/user', userRouter)

router.use('/bill_category', billCategoryRouter)

module.exports = router.routes()
