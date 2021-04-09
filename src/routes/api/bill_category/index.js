const router = require('koa-router')()
const ObjectId = require('mongodb').ObjectId
const billCategory = require('../../../model/bill_category/index')
const moment = require('moment')

// 获取分页的分类（只能精准查询）
router.get('/list', async (ctx, next) => {
  const data = ctx.request.query
  const user_id = ctx.state.userinfo.id
  const res = await billCategory.findList({ ...data, user_id })
  ctx.body = res
})

router.get('/getSystemCategory', async (ctx, next) => {
  const { id } = ctx.request.query
  const res = await billCategory.findOne({
    is_system: 1,
    id
  })
  ctx.body = res
})

/* 新增账单分类
系统图标的id是1，2，3，4...，没有user_id
自定义图标的id是下斜线开头的_，有user_id
is_system为1是系统图标0为自定义图标
（只可以插入自定义图标）
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


/*修改账单分类
系统内置分类不能更改(通过query_id, query_name,查询)
可修改  name, is_income, icon_n, icon_l, icon_s
*/
router.post('/update', async (ctx, next) => {
  const { query_id, query_name, name, is_income, icon_n, icon_l, icon_s } = ctx.request.body
  const user_id = ctx.state.userinfo.id
  const res = await billCategory.updateOne({
    ...(query_id ? { _id: ObjectId(query_id) } : {}),
    ...(query_name ? { name: query_name } : {}),
    user_id: ObjectId(user_id),
    is_system: 0
  }, {
    ...(name ? { name } : {}),
    ...(is_income !== undefined ? { is_income } : {}),
    ...(icon_n ? { icon_n } : {}),
    ...(icon_l ? { icon_l } : {}),
    ...(icon_s ? { icon_s } : {}),
  })
  ctx.body = res
})

/* 删除账单分类
只能删除自定义分类
*/
router.delete('/delete', async (ctx, next) => {
  const { name, id } = ctx.request.body
  const user_id = ctx.state.userinfo.id
  if (name || id) {
    const res = await billCategory.deleteOne({
      ...(id ? { _id: ObjectId(id) } : {}),
      ...(name ? { name } : {}),
      user_id: ObjectId(user_id),
      is_system: 0
    })
    ctx.body = res
  } else {
    ctx.body = {
      code: 1, info: '请核对删除条件,删除失败'
    }
  }
})
module.exports = router.routes()