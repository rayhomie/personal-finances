const router = require('koa-router')()
const moment = require('moment')
const ObjectId = require('mongodb').ObjectId
const bill = require('../../../model/bill/index')

//获取当前用户的所有账单可分页
router.get('/list', async (ctx, next) => {
  const param = ctx.request.query
  const res = await bill.findList({
    user_id: ctx.state.userinfo.id,
    ...param
  })
  ctx.body = res
})

// 添加一条账单记录
router.post('/add', async (ctx, next) => {
  const {
    category_id,
    amount,
    remark,
    bill_time = moment().unix()
  } = ctx.request.body
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
    ctx.body = {
      info: '请指定账单id',
      code: 1
    };
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

// 当月的总收支（startMonth=2021-03）
router.get('/billboard', async (ctx, next) => {
  const { startMonth } = ctx.request.query
  const user_id = ObjectId(ctx.state.userinfo.id)
  const startUnix = moment(startMonth).unix()
  const endUnix = moment(startMonth).add(1, 'month').unix()
  const res = await bill.aggregate(
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
  ctx.body = res
})

/* 
    按照月为单位，以日期为分组的列表
    当月的总收支（startMonth=2021-03）
*/
router.get('/classifyList', async (ctx, next) => {
  const { startMonth } = ctx.request.query
  const user_id = ObjectId(ctx.state.userinfo.id)
  const startUnix = moment(startMonth).unix()
  const endUnix = moment(startMonth).add(1, 'month').unix()
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
    ]
  )
  if (res.docs) {
    // 将当月的账单按照每天进行分类区分出来
    const newRes = new Array((endUnix - startUnix) / 86400).fill('').map((item, index) => {
      const reslut = res.docs.filter(i =>
        i.bill_time >= startUnix + index * 86400
        &&
        i.bill_time < startUnix + (index + 1) * 86400
      )
      return { date: startUnix + index * 86400, item: reslut }
    });
    // 将没有进行记账的日期进行过滤
    const filterRes = newRes.filter(i => i.item.length > 0)
    // 分别计算当天的收支情况
    const lastRes = filterRes.map(i => {
      const value = i.item.reduce((pre, cur) => {
        if (cur.category[0].is_income === 1) {
          pre[0] = pre[0] + cur.amount
          return pre
        } else {
          pre[1] = pre[1] + cur.amount
          return pre
        }
      }, [0, 0])
      return { ...i, income: value[0], expend: value[1] }
    })
    ctx.body = { docs: lastRes, code: 0 }
  } else {
    ctx.body = {
      info: '未查询到账单',
      code: 1
    }
  }
})

/*
    月排行
    startMonth=2021-03
    sort:'amount'|'bill_time'
    is_income:0|1
*/
router.get('/monthRank', async (ctx, next) => {
  const { startMonth, is_income, sort = 'amount' } = ctx.request.query
  const user_id = ObjectId(ctx.state.userinfo.id)
  const startUnix = moment(startMonth).unix()
  const endUnix = moment(startMonth).add(1, 'month').unix()
  const res = await bill.aggregate(
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
      {
        $sort: { [`${sort}`]: 1 }
      }
    ]
  )

  ctx.body = res
})


module.exports = router.routes()