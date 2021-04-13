const router = require('koa-router')()
const ObjectId = require('mongodb').ObjectId
const bill = require('../../../model/bill/index')
const rank = require('./middleware/rank')
const { ParseTwoDecimalPlaces } = require('../../../util/index')

/*
    收支排行榜
    date:'2021-04-02 12:40:45'
    is_income: 0|1,
    type:1（周）,2（月）,3（年）
*/
router.get('/rank', async (ctx, next) => {
  const { date, type, is_income } = ctx.request.query
  const user_id = ObjectId(ctx.state.userinfo.id)
  const [startUnix, endUnix, days, classify] = rank[type](date)

  // 按分类查询排行榜
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
      {
        $match: { 'category.is_income': Number(is_income) }
      },
      {// 0是支出，1是收入
        $group: { _id: { category: "$category", }, total: { $sum: "$amount" } }
      },
      {
        $sort: { total: -1 }
      }
    ]
  )
  // 按日期查询账单
  const res = await bill.aggregate(
    [
      {
        $match: { user_id, bill_time: { $gte: startUnix, $lt: endUnix } }
      },
      {
        $sort: { bill_time: 1 }
      },
      {
        $lookup: {// 关联表查询
          from: "bill_category",// 需要关联的表是：bill_category(非主表)
          localField: "category_id",// bill表(主表)中需要关联的字段
          foreignField: "_id",// bill_category(非主表)中需要关联的字段
          as: "category"// 关联查询后把bill_category(非主表)对应结果放到bill表(主表)的category字段中
        }
      },
      {
        $match: { 'category.is_income': Number(is_income) }
      },
    ]
  )

  if (result.code * res.code === 0) {
    const total = ParseTwoDecimalPlaces(result.docs.reduce((pre, cur) => (pre + cur.total), 0))
    ctx.body = {
      ...result,
      total,// 总值
      average: ParseTwoDecimalPlaces(total / days), // 平均值
      ...(type !== ('3' || 3) ? { days } : { months: days }),// 总天数
      classifyList: classify(res.docs)// 按日期分类的列表
    }
  } else {
    ctx.body = { classifyInfo: res, rankInfo: result }
  }
})

/*
    收支排行榜的类目账单详情
    date:'2021-04-02 12:40:45'
    category_id:'60549b28ef5de3c110382ec4'
    type:1（周）,2（月）,3（年）
    sort:'amount','bill_time'
*/
router.get('/rankItem', async (ctx, next) => {
  const { date, type, category_id, sort = 'amount' } = ctx.request.query
  const user_id = ObjectId(ctx.state.userinfo.id)
  const [startUnix, endUnix] = rank[type](date)
  // 按分类查询排行榜
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
      {
        $match: { 'category._id': ObjectId(category_id) }
      },
      {
        $sort: { [`${sort}`]: -1 }
      }
    ]
  )

  ctx.body = result
})


module.exports = router.routes()