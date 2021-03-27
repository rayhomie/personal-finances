const router = require('koa-router')()
const moment = require('moment')
const budget = require('../../../model/budget/index')

//获取当前用户的所有预算
router.get('/list', async (ctx, next) => {
    const param = ctx.request.query
    const res = await budget.getList({
        user_id: ctx.state.userinfo.id,
        ...param
    })
    ctx.body = res
})

// 设置预算
router.post('/add', async (ctx, next) => {
    const param = ctx.request.body
    const user_id = ctx.state.userinfo.id
    const startMonth = moment().startOf('month').unix()
    const endMonth = moment().endOf('month').add(1, 'day').startOf('day').unix()
    const query = await budget.findOne({
        user_id,
        create_time: { $gte: startMonth, $lt: endMonth }
    })
    if (query.docs) {
        console.log(query.docs)
        // 当月已经设置预算
        const res = await budget.updateOne({ _id: query.docs._id }, param)
        ctx.body = res
    } else {
        const res = await budget.insertOne({
            user_id,
            create_time: moment().unix(),
            ...param
        })
        ctx.body = res
    }
})

// 删除当月预算
router.delete('/delete', async (ctx, next) => {

})

module.exports = router.routes()