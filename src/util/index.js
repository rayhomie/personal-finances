/*
  返回的数字都是取两位小数
  Two decimal places
*/
const ParseTwoDecimalPlaces = (value) => {
  return +(+value).toFixed(2)
}

module.exports = {
  ParseTwoDecimalPlaces
}