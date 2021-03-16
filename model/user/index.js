const UserModel = require('../../dbs/user/index')


class UserController {
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
}

module.exports = new UserController()
