// 月排行
const moment = require('moment')
const { ParseTwoDecimalPlaces } = require('../../../../../util/index')

module.exports = (date) => {
  const startMonthUnix = moment(date).startOf('month').unix()
  const endMonthUnix = moment(date).endOf('month').add(1, 'day').startOf('day').unix()
  const days = (endMonthUnix - startMonthUnix) / 86400
  const monthify = (docs) => {
    const res = new Array(days).fill('').map((item, index) => {
      const reslut = docs.filter(i =>
        i.bill_time >= startMonthUnix + index * 86400
        &&
        i.bill_time < startMonthUnix + (index + 1) * 86400
      )
      // 当天的总值
      const cur_total = ParseTwoDecimalPlaces(reslut.reduce((pre, cur) => pre + cur.amount, 0))
      return { date: startMonthUnix + index * 86400, item: reslut, cur_total }
    })
    return res
  }
  return [startMonthUnix, endMonthUnix, days, monthify]
}