const crypto = require("crypto"),
  jwt = require("jsonwebtoken"),
  user = require("./model/user/index"),
  secret = require('./secret.json');
// TODO:使用数据库
// 这里应该是用数据库存储，这里只是演示用
// let userList = [{ name: 'rayhomie', password: crypto.createHash('md5').update('123456').digest('hex') }];

class UserController {
  // 用户登录
  static async login(ctx) {
    const data = ctx.request.query;
    if (!data.username || !data.password) {
      return ctx.body = {
        code: "000002",
        message: "参数不合法"
      }
    }
    const result = await user.findOne({ username: data.username, password: crypto.createHash('md5').update(data.password).digest('hex') })
    if (result) {
      const token = jwt.sign(
        {
          name: result.username
        },
        secret.sign, // secret
        { expiresIn: 60 * 60 } // 60 * 60 s
      );
      return ctx.body = {
        code: "0",
        message: "登录成功",
        data: {
          token
        }
      };
    } else {
      return ctx.body = {
        code: "000002",
        message: "用户名或密码错误"
      };
    }
  }
}

module.exports = UserController;