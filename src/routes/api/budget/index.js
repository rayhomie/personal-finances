const router = require('koa-router')()
const moment = require('moment')
const budget = require('../../../model/budget/index')
const ObjectId = require('mongodb').ObjectId
const bill = require('../../../model/bill/index')

//获取当前用户的所有预算
router.get('/current', async (ctx, next) => {
  const user_id = ObjectId(ctx.state.userinfo.id)
  const startUnix = moment().startOf('month').unix()
  const endUnix = moment().endOf('month').add(1, 'day').startOf('day').unix()
  const res = await budget.findOne({
    user_id,
    create_time: { $gte: startUnix, $lt: endUnix }
  })
  const result = await bill.aggregate(
    [
      {
        $match: { user_id, bill_time: { $gte: startUnix, $lt: endUnix } }
      },
      {
        $lookup: {// 关联表查询
          from: "bill_category",// 需要关联的表是：bill_category(非主表)
          localField: "category_id",// bill表(主表)中需要关联的字段
          foreignField: "_id",// bill_category(非主表)中需要关联的字段
          as: "category"// 关联查询后把bill_category(非主表)对应结果放到bill表(主表)的category字段中
        }
      },
      {// 0是支出，1是收入
        $group: { _id: { is_income: "$category.is_income" }, total: { $sum: "$amount" } }
      }
    ]
  )
  let pay = 0
  if (result.code === 0) {
    result.docs.forEach(i => {
      if (i._id.is_income[0] === 0) {
        pay = i.total
      }
    })
  } else {
    ctx.body = { code: 1, info: '查询支出失败' }
  }
  ctx.body = { ...res, pay: pay }
})

// 设置预算
router.post('/add', async (ctx, next) => {
  const param = ctx.request.body
  const user_id = ctx.state.userinfo.id
  const startMonth = moment().startOf('month').unix()
  const endMonth = moment().endOf('month').add(1, 'day').startOf('day').unix()
  const query = await budget.findOne({
    user_id,
    create_time: { $gte: startMonth, $lt: endMonth }
  })
  if (query.docs) {
    // 当月已经设置预算
    const res = await budget.updateOne({ _id: query.docs._id }, param)
    ctx.body = res
  } else {
    const res = await budget.insertOne({
      user_id,
      create_time: moment().unix(),
      ...param
    })
    ctx.body = res
  }
})

// 删除当月预算
router.post('/delete', async (ctx, next) => {
  const user_id = ctx.state.userinfo.id
  const startMonth = moment().startOf('month').unix()
  const endMonth = moment().endOf('month').add(1, 'day').startOf('day').unix()
  const query = await budget.findOne({
    user_id,
    create_time: { $gte: startMonth, $lt: endMonth }
  })
  if (query.docs) {
    const res = await budget.deleteOne({
      user_id,
      _id: query.docs._id
    })
    ctx.body = res
  } else {
    ctx.body = {
      info: '无预算进行删除操作',
      code: 1
    }
  }

})

module.exports = router.routes()