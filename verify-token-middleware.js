const jwt = require('jsonwebtoken'),
  util = require('util'),
  verify = util.promisify(jwt.verify),
  secret = require('./secret.json')


// 判断token是否可用
module.exports = () => {
  return async (ctx, next) => {
    try {
      const token = ctx.header.authorization
      if (token) {
        let payload
        try {
          payload = await verify(token.split(' ')[1], secret.sign)
          ctx.state.userinfo = {
            username: payload.name,
            id: payload.id
          }
        } catch (e) {
          console.error('token verify failed :', e)
        }
      }
      await next()
    } catch (e) {
      if (e.status === 401) {
        ctx.status = 200
        ctx.body = {
          code: 401,
          message: '认证失败'
        }
      } else {
        ctx.status = 200
        ctx.body = {
          code: 404,
          message: '404'
        }
      }
    }
  }
}