const BillCategoryModel = require('../../dbs/bill_category/index')


class BillCategoryController {
  findList(json) {
    return new Promise((resolve, reject) => {
      const { limit = 0, skip = 0, ...restJson } = json
      BillCategoryModel.find(restJson, (err, docs) => {
        if (err) {
          resolve({ err, code: 1 });
          return;
        }
        resolve({ docs, code: 0 })
      })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
    })
  }

  insertOne(json) {
    return new Promise(async (resolve, reject) => {
      const res = await this.findList({})
      const instance = await new BillCategoryModel({ ...json, index: res.docs.length + 1 })
      await instance.save((err, docs) => {
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
      BillCategoryModel.updateOne(
        json1,
        { $set: json2 },
        (err, docs) => {
          if (err) {
            resolve({ err, code: 1, info: '修改失败' });
            return;
          }
          if (docs.n === 1 && docs.nModified === 1) {
            resolve({ docs, code: 0, info: '修改成功' })
          } else {
            resolve({ docs, code: 1, info: '修改失败' })
          }

        })
    })
  }

  deleteOne(json) {
    return new Promise((resolve, reject) => {
      BillCategoryModel.remove(json, (err, docs) => {
        if (err) {
          resolve({ err, code: 1, info: '删除失败' })
          return
        }
        resolve({ docs, code: 0, info: '删除成功' })
      })
    })
  }
}

module.exports = new BillCategoryController()
