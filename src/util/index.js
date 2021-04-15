/*
  返回的数字都是取两位小数
  Two decimal places
*/
const ParseTwoDecimalPlaces = (value) => {
  return +(+value).toFixed(2)
}

/*
  求百分比保留一位小数
*/
const percentify = (top, bottom) => {
  return Math.round((top / bottom) * 1000) / 10
}

module.exports = {
  ParseTwoDecimalPlaces,
  percentify
}