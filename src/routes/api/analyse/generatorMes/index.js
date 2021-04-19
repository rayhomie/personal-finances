const preMonthPay = require('./preMonthPay')
const preMonthIncome = require('./preMonthIncome')
const curMonth = require('./curMonth')

module.exports = {
  'cur': curMonth,
  'pay': preMonthPay,
  'income': preMonthIncome
}