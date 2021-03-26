const UserModel = require('../../dbs/user/index')


class UserController {
  findOne(json) {
    return new Promise((resolve, reject) => {
      UserModel.findOne(json, (err, docs) => {
        if (err) {
          resolve({ err, code: 1 });
          return;
        }
        resolve({ docs, code: 0 })
      })
    })
  }

  find(json) {
    return new Promise((resolve, reject) => {
      UserModel.find(json, (err, docs) => {
        if (err) {
          resolve({ err, code: 1 });
          return;
        }
        resolve({ docs, total: docs.length, code: 0 })
      })
    })
  }

  register(json) {
    return new Promise((resolve, reject) => {
      const instance = new UserModel(json)
      instance.save((err, docs) => {
        if (err) {
          resolve({ err, code: 1 });
          return
        }
        resolve({ docs, code: 0 })
      })//执行增加操作
    })
  }

  updateOne(json1, json2) {
    return new Promise((resolve, reject) => {
      UserModel.updateOne(
        json1,
        { $set: json2 },
        (err, docs) => {
          if (err) {
            resolve({ err, code: 1 });
            return;
          }
          resolve({ docs, code: 0 })
        })
    })
  }
}

module.exports = new UserController()
