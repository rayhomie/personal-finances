const router = require('koa-router')()
const clock = require('../../../model/clock/index')
const moment = require('moment')

// 获取打卡记录
router.get('/clockList', async (ctx, next) => {
    const data = ctx.request.query
    const res = await clock.getList(data)
    ctx.body = res
})

router.post('/clock', async (ctx, next) => {
    const { clock_date } = ctx.request.body
    const startTime = moment(clock_date).startOf('date').unix()
    const endTime = moment(clock_date).add(1, 'd').startOf('date').unix()
    const query = await clock.findOne({ clock_date: { $gte: startTime, $lt: endTime } })
    if (!query.docs) {
        const res = await clock.insertOne({ clock_date: moment(clock_date).unix() })
        ctx.body = res
    } else {
        ctx.body = {
            info: '当前日期已打卡',
            code: 1
        }
    }
})


module.exports = router.routes()