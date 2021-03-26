const ClockModel = require('../../dbs/clock/index')


class ClockController {
    getList(json) {
        return new Promise((resolve, reject) => {
            ClockModel.find(json, (err, docs) => {
                if (err) {
                    resolve({ err, code: 1 });
                    return;
                }
                resolve({ docs, code: 0 })
            })
        })
    }
    
    findOne(json) {
        return new Promise((resolve, reject) => {
            ClockModel.findOne(json, (err, docs) => {
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
            const instance = await new ClockModel({ ...json })
            await instance.save((err, docs) => {
                if (err) {
                    resolve({ err, code: 1 });
                    return
                }
                resolve({ docs, code: 0 })
            })//执行增加操作
        })
    }
}

module.exports = new ClockController()
