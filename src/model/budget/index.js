const BudgetModel = require('../../dbs/budget/index')


class BudgetController {
    getList(json) {
        return new Promise((resolve, reject) => {
            BudgetModel.find(json, (err, docs) => {
                if (err) {
                    resolve({ err, code: 1 });
                    return;
                }
                resolve({ docs, total: docs.length, code: 0 })
            })
        })
    }

    findOne(json) {
        return new Promise((resolve, reject) => {
            BudgetModel.findOne(json, (err, docs) => {
                if (err) {
                    resolve({ err, code: 1 });
                    return;
                }
                resolve({ docs, code: 0 })
            })
        })
    }

    insertOne(json) {
        return new Promise(async (resolve, reject) => {
            const instance = await new BudgetModel({ ...json })
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
            BudgetModel.updateOne(
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
            BudgetModel.remove(json, (err, docs) => {
                if (err) {
                    resolve({ err, code: 1, info: '删除失败' })
                    return
                }
                if (docs.n === 1 && docs.deletedCount === 1) {
                    resolve({ docs, code: 0, info: '删除成功' })
                } else {
                    resolve({ docs, code: 1, info: '删除失败' })
                }
            })
        })
    }
}

module.exports = new BudgetController()
