const router = require('koa-router')()
const ObjectId = require('mongodb').ObjectId
const billCategory = require('../../../model/bill_category/index')
const bill = require('../../../model/bill/index')
const moment = require('moment')
const generateMessage = require('./generatorMes/index')

const transformRes = (docs) => {//转换成格式：[支出，收入]
  return docs.reduce((pre, cur) => {
    pre[cur._id.is_income[0]] = cur.total
    return pre
  }, [0, 0])
}

/*
    分析收入支出
    date：2021-04-19 12:23:32
    type：'all'|'cur'|'pay'|'income'
*/
router.get('/pay&income', async (ctx, next) => {
  const { date, type = 'all' } = ctx.query
  const user_id = ObjectId(ctx.state.userinfo.id)
  const startUnix = moment(date).startOf('month').unix()
  const endUnix = moment(date).endOf('month').add(1, 'day').startOf('day').unix()
  const preStartUnix = moment.unix(startUnix).add(-1, 'month').unix()
  const preEndUnix = moment.unix(endUnix).add(-1, 'month').unix()
  //本月
  const res0 = bill.aggregate([
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
      $group: { _id: { is_income: "$category.is_income", }, total: { $sum: "$amount" } }
    }
  ])
  //上月
  const res1 = bill.aggregate([
    {
      $match: { user_id, bill_time: { $gte: preStartUnix, $lt: preEndUnix } }
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
      $group: { _id: { is_income: "$category.is_income", }, total: { $sum: "$amount" } }
    }
  ])

  const Res = await Promise.all([res0, res1])
  if (!Res.map(i => i.code).includes(1)) {
    //res0的结果转换
    const handleRes0 = transformRes(Res[0].docs)
    //res1的结果转换
    const handleRes1 = transformRes(Res[1].docs)

    ctx.body = {
      code: 0,
      [`${type}_msg`]:
        type === 'all' ?
          {
            cur_msg: generateMessage['cur'](handleRes0, handleRes1),
            pay_msg: generateMessage['pay'](handleRes0, handleRes1),
            income_msg: generateMessage['income'](handleRes0, handleRes1),
          }
          :
          generateMessage[type](handleRes0, handleRes1),
    }
  } else {
    ctx.body = { code: 1, ...Res }
  }
})

module.exports = router.routes()