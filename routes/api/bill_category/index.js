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
router.post('/update', async (ctx, next) => {
  const { id, title, new_title, new_isIncome, new_icon } = ctx.request.body
  const res = await billCategory.updateOne({
    ...(id ? { _id: ObjectId(id) } : {}),
    ...(title ? { title } : {}),
  }, {
    ...(new_title ? { title: new_title } : {}),
    ...(new_isIncome ? { isIncome: parseInt(new_isIncome) } : {}),
    ...(new_icon ? { icon: new_icon } : {}),
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