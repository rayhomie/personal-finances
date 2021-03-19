const router = require('koa-router')()
const ObjectId = require('mongodb').ObjectId
const billCategory = require('../../../model/bill_category/index')

// 获取分页的分类（只能精准查询）
router.get('/list', async (ctx, next) => {
  const data = ctx.request.query
  const res = await billCategory.findList(data)
  ctx.body = res
})

// 新增账单分类
router.post('/insert', async (ctx, next) => {
  const data = ctx.request.body
  const res = await billCategory.insertOne(data)
  ctx.body = res
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

// 修改交换分类的index

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