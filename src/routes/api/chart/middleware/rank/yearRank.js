// 年排行
const moment = require('moment')
const { ParseTwoDecimalPlaces } = require('../../../../../util/index')

// 生成每月对应日期的Map
const GeneratorMonthMap = (February) => new Map([
  [0, 0],
  [1, 31], [2, February], [3, 31], [4, 30], [5, 31], [6, 30],
  [7, 31], [8, 31], [9, 30], [10, 31], [11, 30], [12, 31],
])

module.exports = (date) => {
  const startYearUnix = moment(date).startOf('year').unix()
  const endYearUnix = moment(date).endOf('year').add(1, 'day').startOf('day').unix()
  const month = 12
  const FebruaryDays = moment(`${moment(date).format('YYYY')}-02`, "YYYY-MM").daysInMonth()
  const map = GeneratorMonthMap(FebruaryDays)
  const yearify = (docs) => {
    let cur = startYearUnix
    const res = new Array(month).fill('').map((item, index) => {
      cur = cur + map.get(index) * 86400
      // console.log(moment.unix(cur), moment.unix(cur + map.get(index + 1) * 86400));
      const reslut = docs.filter(
        i => i.bill_time >= cur
          &&
          i.bill_time < cur + map.get(index + 1) * 86400
      )
      // 当天的总值
      const month_total = ParseTwoDecimalPlaces(reslut.reduce((pre, cur) => pre + cur.amount, 0))
      return { date: cur, item: reslut, month_total }
    })
    return res
  }
  return [startYearUnix, endYearUnix, month, yearify]
}