const router = require('koa-router')()
const bill = require('../../../model/bill/index')

//获取当前用户的所有账单可分页
router.get('/list', async (ctx, next) => {
  const param = ctx.request.query
  const res = await bill.findList({ user_id: ctx.state.userinfo.id, ...param })
  ctx.body = res
})

// 添加一条账单记录
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

// 更新某条账单的信息
router.post('/update', async (ctx, next) => {
  const { id, ...restParam } = ctx.request.body
  if (!id) {
    ctx.body = { info: '请指定账单id', code: 1 };
    return;
  }
  const res = await bill.updateOne(
    {
      user_id: ctx.state.userinfo.id,
      _id: id
    },
    restParam
  )
  ctx.body = res
})

// 删除当前用户的指定id的某条账单
router.delete('/delete', async (ctx, next) => {
  const { id } = ctx.request.body
  const res = await bill.deleteOne({
    user_id: ctx.state.userinfo.id,
    _id: id
  })
  ctx.body = res
})

module.exports = router.routes()