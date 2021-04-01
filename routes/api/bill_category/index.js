const router = require('koa-router')()
const ObjectId = require('mongodb').ObjectId
const billCategory = require('../../../model/bill_category/index')
const moment = require('moment')

// 获取分页的分类（只能精准查询）
router.get('/list', async (ctx, next) => {
  const data = ctx.request.query
  const res = await billCategory.findList(data)
  ctx.body = res
})

/* 新增账单分类
系统图标的id是1，2，3，4...，没有user_id
自定义图标的id是下斜线开头的_，有user_id
is_system为1是系统图标0为自定义图标
*/
router.post('/insert', async (ctx, next) => {
  const data = ctx.request.body
  const user_id = ctx.state.userinfo.id
  const { id = '', ...rest } = data
  if (data.is_system === ('1' || 1) && id === '') {
    ctx.body = { info: '系统图标请输入id', code: 1 }
  } else {
    const res = await billCategory.insertOne({
      ...rest,
      ...(data.is_system === ('1' || 1) ? {} : { user_id }),
      ...(data.is_system === ('1' || 1) ? { id } : { id: `_${moment().unix()}` })
    })
    ctx.body = res
  }
})

// 修改账单分类
/*
交换新旧index顺序的时候，需要前端同号输入新旧index
（所以在交换index之前需要查询一下数据量中的index的正负号）
*/
router.post('/update', async (ctx, next) => {
  const { id, title, index, new_title, new_isIncome, new_icon, new_index } = ctx.request.body
  const res = await billCategory.updateOne({
    ...(id ? { _id: ObjectId(id) } : {}),
    ...(title ? { title } : {}),
    ...(index ? { index } : {}),
  }, {
    ...(new_title ? { title: new_title } : {}),
    ...(new_isIncome ? { isIncome: parseInt(new_isIncome) } : {}),
    ...(new_icon ? { icon: new_icon } : {}),
    ...(new_index ? { index: -1 * parseInt(new_index) } : {}),
  })
  ctx.body = res
})

// 删除账单分类
router.delete('/delete', async (ctx, next) => {
  const { title, id } = ctx.request.body
  if (title || id) {
    const res = await billCategory.deleteOne({
      ...(id ? { _id: ObjectId(id) } : {}),
      ...(title ? { title } : {}),
    })
    ctx.body = res
  } else {
    ctx.body = {
      code: 1, info: '请核对删除条件,删除失败'
    }
  }
})
module.exports = router.routes()