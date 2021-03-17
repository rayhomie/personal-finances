const UserModel = require('../../dbs/user/index')


class UserController {
  findOne(json) {
    return new Promise((resolve, reject) => {
      UserModel.findOne(json, (err, docs) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(docs)
      })
    })
  }

  find(json) {
    return new Promise((resolve, reject) => {
      UserModel.find(json, (err, docs) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(docs)
      })
    })
  }

  register(json) {
    return new Promise((resolve, reject) => {
      const instance = new UserModel(json)
      instance.save((err, docs) => {
        if (err) {
          console.log(err)
          resolve(err);
          return
        }
        resolve({ docs, code: 0 })
      })//执行增加操作
    })
  }

  updateOne(json) {

  }
}

module.exports = new UserController()
