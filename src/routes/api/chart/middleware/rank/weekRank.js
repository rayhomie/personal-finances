// 周排行
const moment = require('moment')
const { ParseTwoDecimalPlaces } = require('../../../../../util/index')

module.exports = (date) => {
  const startWeekUnix = moment(date).startOf('week').add(1, 'day').unix()
  const endWeekUnix = moment(date).endOf('week').add(2, 'day').startOf('day').unix()
  const days = (endWeekUnix - startWeekUnix) / 86400
  const weekify = (docs) => {
    const res = new Array(days).fill('').map((item, index) => {
      const reslut = docs.filter(i =>
        i.bill_time >= startWeekUnix + index * 86400
        &&
        i.bill_time < startWeekUnix + (index + 1) * 86400
      )
      // 当天的总值
      const cur_total = ParseTwoDecimalPlaces(reslut.reduce((pre, cur) => pre + cur.amount, 0))
      return { date: startWeekUnix + index * 86400, item: reslut, cur_total }
    })
    return res
  }
  return [startWeekUnix, endWeekUnix, days, weekify]
}
