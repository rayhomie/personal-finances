const BillCategoryModel = require('../../dbs/bill_category/index')


class BillCategoryController {
  findOne(json) {
    return new Promise((resolve, reject) => {
      BillCategoryModel.findOne(json, (err, docs) => {
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
      BillCategoryModel.find(json, (err, docs) => {
        if (err) {
          resolve({ err, code: 1 });
          return;
        }
        resolve({ docs, code: 0 })
      })
    })
  }

  insertOne(json) {
    return new Promise((resolve, reject) => {
      const instance = new BillCategoryModel(json)
      instance.save((err, docs) => {
        if (err) {
          resolve({ err, code: 1 });
          return
        }
        resolve({ docs, code: 0 })
      })//执行增加操作
    })
  }

  // updateOne(json1, json2) {
  //   return new Promise((resolve, reject) => {
  //     UserModel.updateOne(
  //       json1,
  //       { $set: json2 },
  //       (err, docs) => {
  //         if (err) {
  //           resolve({ err, code: 1 });
  //           return;
  //         }
  //         resolve({ docs, code: 0 })
  //       })
  //   })
  // }
}

module.exports = new BillCategoryController()
