const router = require('koa-router')()
const ObjectId = require('mongodb').ObjectId
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

// 修改除username、password之外的信息
router.post('/updateInfo', async (ctx, next) => {
  const { avatar_url, gender, mobile_number } = ctx.request.body
  const { username, id } = ctx.state.userinfo
  const res = await user.updateOne({
    username,
    _id: ObjectId(id)
  }, {
    avatar_url,
    gender,
    mobile_number
  })
  ctx.body = res
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
      ctx.body = { info: '账号已更改，请重新登陆', code: 1 }
    } else {
      ctx.body = res
    }
  } else {
    ctx.body = { info: '用户名已存在', code: 1 }
  }
})

// 修改password
router.post('/pwd', async (ctx, next) => {
  const { password } = ctx.request.body
  const { username, id } = ctx.state.userinfo
  console.log(password, ctx.state.userinfo)
  const res = await user.updateOne({
    username,
    _id: ObjectId(id)
  }, {
    password: crypto.createHash('md5').update(password).digest('hex')
  })
  ctx.body = res
})


module.exports = router.routes()