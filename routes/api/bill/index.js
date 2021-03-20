const router = require('koa-router')()
const bill = require('../../../model/bill/index')

router.get('/list', async (ctx, next) => {
  const param = ctx.request.query
  const res = await bill.findList({ user_id: ctx.state.userinfo.id, ...param })
  ctx.body = res
})

router.post('/add', async (ctx, next) => {
  const { category_id, amount, bill_time, remark } = ctx.request.body
  const res = await bill.insertOne(
    {
      user_id: ctx.state.userinfo.id,
      category_id,
      amount,
      bill_time,
      remark,
    })
  ctx.body = res
})

router.post('/update', async (ctx, next) => {

})

router.delete('/delete', async (ctx, next) => {

})






module.exports = router.routes()