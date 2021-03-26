const router = require('koa-router')()
const clock = require('../../../model/clock/index')
const moment = require('moment')

// 获取打卡记录
router.get('/clockList', async (ctx, next) => {
    const data = ctx.request.query
    const res = await clock.getList({
        user_id: ctx.state.userinfo.id,
        ...data
    })
    ctx.body = res
})

// 打卡
router.post('/clock', async (ctx, next) => {
    const { clock_date } = ctx.request.body
    const startTime = moment(clock_date).startOf('date').unix()
    const endTime = moment(clock_date).add(1, 'd').startOf('date').unix()
    const query = await clock.findOne({
        user_id: ctx.state.userinfo.id,
        clock_date: { $gte: startTime, $lt: endTime }
    })
    if (!query.docs) {
        const res = await clock.insertOne({
            user_id: ctx.state.userinfo.id,
            date: moment(clock_date).format('YYYY-MM-DD HH:mm:ss'),
            clock_date: moment(clock_date).unix()
        })
        ctx.body = res
    } else {
        ctx.body = {
            info: '当前日期已打卡',
            code: 1
        }
    }
})

// 获取当前连续打卡次数
router.get('/continueCount', async (ctx, next) => {
    const now_date = moment()
    const res = await clock.getList({
        user_id: ctx.state.userinfo.id,
        clock_date: { $lt: now_date.unix() }
    })
    const resArr = res.docs
    if (resArr) {
        const clock_date = resArr.map(item =>
            moment.unix(item.clock_date)
                .startOf('date')
                .unix()
        )
        // 排序从大到小
        clock_date.sort(function (a, b) {
            return b - a;
        })

        if (clock_date[0] === now_date.startOf('date').unix()) {
            // 判断是否当天打卡
            // const result = clock_date.reduce((pre, cur, index) => {
            //     if (index === 0) {
            //         if (cur === pre[0]) {
            //             pre[1]++
            //             return pre
            //         } else {
            //             pre[0] = cur
            //             pre[1]++
            //             return pre
            //         }
            //     }
            //     if (pre[0] - cur === 86400) {
            //         pre[1]++
            //         pre[0] = cur
            //         return pre
            //     }
            //     return pre
            // }, [now_date.startOf('date').unix(), 0])
        }

        ctx.body = {
            continue_count: result[1],
            code: 0
        }
    } else {
        ctx.body = {
            info: '接口错误，检查代码',
            code: 1
        }
    }
})


module.exports = router.routes()