const router = require('koa-router')()
const ObjectId = require('mongodb').ObjectId
const moment = require('moment')
const user = require('../../../model/user/index')
const crypto = require("crypto")


// 获取用户信息
router.get('/info', async (ctx, next) => {
  const { username, id } = ctx.state.userinfo
  const res = await user.findOne({
    username,
    _id: ObjectId(id)
  })
  ctx.body = res
})

// 获取用户加入至今的天数
router.get('/joinDays', async (ctx, next) => {
  const { username, id } = ctx.state.userinfo
  const res = await user.findOne({
    username,
    _id: ObjectId(id)
  });
  const { create_time } = res.docs;
  const now_time = moment().unix();
  const days = Math.ceil((now_time - create_time) / 86400)
  ctx.body = { days, code: 0 }
})

// 修改除username、password之外的信息
router.post('/updateInfo', async (ctx, next) => {
  const { avatar_url, gender, mobile_number, email } = ctx.request.body
  const { username, id } = ctx.state.userinfo
  const res = await user.updateOne({
    username,
    _id: ObjectId(id)
  }, {
    ...(avatar_url ? { avatar_url } : {}),
    ...(gender !== undefined ? { gender } : {}),
    ...(mobile_number ? { mobile_number } : {}),
    ...(email ? { email } : {}),
  })
  if (res.docs.n === 1 && res.docs.nModified === 1) {
    ctx.body = { ...res, info: '修改成功' }
  } else {
    ctx.body = { ...res, code: 1, info: '修改失败' }
  }
})

// 修改username
router.post('/username', async (ctx, next) => {
  const { username, id } = ctx.state.userinfo
  const findResult = await user.findOne({ username: ctx.request.body.username })
  if (!findResult.docs) {
    // 如果用户名是否存在
    const res = await user.updateOne({
      username,
      _id: ObjectId(id)
    }, {
      username: ctx.request.body.username
    })
    // 如果数据库中的数据有一条被修改则成功，否则需要重新登陆携带token
    if (res.docs.nModified === 0) {
      ctx.body = { info: '账号已更改，请重新登陆', code: 401 }
    } else {
      ctx.body = { ...res, code: 401 }
    }
  } else {
    ctx.body = { info: '用户名已存在', code: 1 }
  }
})

// 修改password
router.post('/pwd', async (ctx, next) => {
  const { password } = ctx.request.body
  const { username, id } = ctx.state.userinfo
  const res = await user.updateOne({
    username,
    _id: ObjectId(id)
  }, {
    password: crypto.createHash('md5').update(password).digest('hex')
  })
  if (res.docs.nModified === 0) {
    ctx.body = { ...res, info: '密码和之前的一致，未变动', code: 0 }
  } else {
    ctx.body = { ...res, info: '密码已更改，请重新登陆', code: 401 }
  }
})


module.exports = router.routes()