const router = require('koa-router')()
const moment = require('moment')
const ObjectId = require('mongodb').ObjectId
const bill = require('../../../model/bill/index')
const user = require('../../../model/user/index')
const { ParseTwoDecimalPlaces, percentify } = require('../../../util/index')

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
router.post('/delete', async (ctx, next) => {
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
        $sort: { [`${sort}`]: -1 }
      }
    ]
  )

  ctx.body = res
})

/*
    我的账单
    date:'2021-04-02 12:40:45'
*/
// 生成每月对应日期的Map
const GeneratorMonthMap = (February) => new Map([
  [0, 0],
  [1, 31], [2, February], [3, 31], [4, 30], [5, 31], [6, 30],
  [7, 31], [8, 31], [9, 30], [10, 31], [11, 30], [12, 31],
])

router.get('/mineAccount', async (ctx, next) => {
  const { date } = ctx.query
  const user_id = ObjectId(ctx.state.userinfo.id)
  const startYearUnix = moment(date).startOf('year').unix()
  const endYearUnix = moment(date).endOf('year').add(1, 'day').startOf('day').unix()

  const res = bill.aggregate(
    [
      {
        $match: { user_id, bill_time: { $gte: startYearUnix, $lt: endYearUnix } }
      },
      {
        $lookup: {// 关联表查询
          from: "bill_category",// 需要关联的表是：bill_category(非主表)
          localField: "category_id",// bill表(主表)中需要关联的字段
          foreignField: "_id",// bill_category(非主表)中需要关联的字段
          as: "category"// 关联查询后把bill_category(非主表)对应结果放到bill表(主表)的category字段中
        }
      }
    ]
  )
  const data = bill.aggregate(
    [
      {
        $match: { user_id, bill_time: { $gte: startYearUnix, $lt: endYearUnix } }
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
      },
    ]
  )
  const [...restRes] = await Promise.all([res, data])
  if (restRes[0].code * restRes[1].code === 0) {
    const FebruaryDays = moment(`${moment(date).format('YYYY')}-02`, "YYYY-MM").daysInMonth()
    const map = GeneratorMonthMap(FebruaryDays)
    let cur = startYearUnix
    const classify = new Array(12).fill('').map((i, index) => {
      cur = cur + map.get(index) * 86400
      const reslut = restRes[0].docs.filter(
        i => i.bill_time >= cur
          &&
          i.bill_time < cur + map.get(index + 1) * 86400
      )
      // 当天的总值
      const cur_total = reslut.reduce((pre, cur) => {
        if (cur.category[0].is_income === 0) {
          pre[0] = pre[0] + cur.amount
          return pre
        } else {
          pre[1] = pre[1] + cur.amount
          return pre
        }
      }, [0, 0])//【支出，收入】
      const [pay_total, income_total] = cur_total
      return {
        date: cur,
        pay_total: ParseTwoDecimalPlaces(pay_total),
        income_total: ParseTwoDecimalPlaces(income_total),
      }
    })

    const [year_pay_total, year_income_total] = restRes[1].docs.reduce((pre, cur) => {
      if (cur._id.is_income[0] === 0) {
        pre[0] = ParseTwoDecimalPlaces(cur.total)
        return pre
      } else {
        pre[1] = ParseTwoDecimalPlaces(cur.total)
        return pre
      }
    }, [0, 0])// 【支出，收入】
    ctx.body = { year_pay_total, year_income_total, docs: classify, code: 0 }
  } else {
    ctx.body = { code: 1 }
  }
})

/*
    获取当月的账单报告
    date:'2021-04-02 12:40:45'
*/

router.get('/mineAccountItem', async (ctx, next) => {
  const { date } = ctx.query
  const user_id = ObjectId(ctx.state.userinfo.id)
  const startUnix = moment(date).startOf('month').unix()
  const endUnix = moment(date).startOf('month').add(1, 'month').unix()
  const preMonthStartUnix = moment.unix(startUnix).add(-1, 'month').unix()
  const preMonthEndUnix = moment.unix(preMonthStartUnix).endOf('month').add(1, 'day').startOf('day').unix()

  const data = bill.aggregate(
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
        $group: { _id: { is_income: "$category.is_income", }, total: { $sum: "$amount" } }
      }
    ]
  )
  const resPre = bill.aggregate(
    [
      {
        $match: { user_id, bill_time: { $gte: preMonthStartUnix, $lt: preMonthEndUnix } }
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
      },
    ]
  )

  const resCate = bill.aggregate(
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
        $match: { 'category.is_income': 0 }
      },
      {// 0是支出，1是收入
        $group: { _id: { category: "$category", }, total: { $sum: "$amount" } }
      },
      {
        $sort: { total: -1 }
      },
    ]
  )

  const userinfo = user.findOne({
    _id: user_id
  })

  const [...restRes] = await Promise.all([data, resPre, resCate, userinfo])

  if (!restRes.map(i => i.code).includes(1)) {
    // 当月收支情况
    const [pay_total, income_total] = restRes[0].docs.reduce((pre, cur) => {
      if (cur._id.is_income[0] === 0) {
        pre[0] = ParseTwoDecimalPlaces(cur.total)
        return pre
      } else {
        pre[1] = ParseTwoDecimalPlaces(cur.total)
        return pre
      }
    }, [0, 0])// 【支出，收入】

    // 计算上月结余
    const [pre_pay_total, pre_income_total] = restRes[1].docs.reduce((pre, cur) => {
      if (cur._id.is_income[0] === 0) {
        pre[0] = ParseTwoDecimalPlaces(cur.total)
        return pre
      } else {
        pre[1] = ParseTwoDecimalPlaces(cur.total)
        return pre
      }
    }, [0, 0])// 【上月支出，上月收入】
    const pre_month_rest = pre_income_total - pre_pay_total

    // 支出类别排行饼状图数据
    let other_total = 0
    let other_top5 = 0
    const pieData = restRes[2].docs.reduce((pre, cur, index) => {
      if (index < 5) {
        pre[index] = {
          name: cur._id.category[0].name,
          total: cur.total,
          proportion: percentify(cur.total, pay_total)
        }
        other_top5 = other_top5 + percentify(cur.total, pay_total)
        return pre
      }
      if (index === restRes[2].docs.length - 1) {
        pre[5] = {
          name: '其他',
          total: other_total,
          proportion: Math.round((100 - other_top5) * 10) / 10
        }
        return pre
      } else {
        other_total = other_total + cur.total
      }
      return pre
    }, [])

    const { username, avatar_url, create_time } = restRes[3].docs
    ctx.body = {
      code: 0,
      pay_total,
      income_total,
      pre_month_rest,
      pieData,
      userinfo: {
        username,
        avatar_url,
        joinDays: Math.ceil((moment().unix() - create_time) / 86400),
      }
    }
  } else {
    ctx.body = { code: 1 }
  }
})

module.exports = router.routes()