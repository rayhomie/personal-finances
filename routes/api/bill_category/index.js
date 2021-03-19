const router = require('koa-router')()

const billCategory = require('../../../model/bill_category/index')

router.post('/insert', async (ctx, next) => {
  const data = ctx.request.body
  console.log(data)
  const res = await billCategory.insertOne(data)
  ctx.body = res
})

module.exports = router.routes()