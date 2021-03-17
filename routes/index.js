const router = require('koa-router')()

const api = require('./api/index')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.use('/api', api)

module.exports = router
