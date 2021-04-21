const genMessage = (curArr, preArr) => {
  /*
    （这月支出-上月支出）/上月支出
    0.x>=0.3 小财发现您这月支出远远高于上月支出哦，注意您近期财务情况
    1.0.3>x>0 小财悄悄提醒您本月支出高于上月支出了哦
    2.0>=x>-0.3 小财注意到您本月支出接近于上月支出了哦
    3.其他 正常
  */
  if (preArr[0] === 0) {
    return { type: 3, msgpay: '小财给您分析，您本月的支出情况正常，请继续保持哦' }
  }
  if (preArr[0] !== 0) {
    const level = (curArr[0] - preArr[0]) / preArr[0]
    if (level >= 0.3) {
      return {
        type: 0,
        msgpay: '小财发现您这月支出远远高于上月支出哦，注意您近期财务情况'
      }
    }
    if (level > 0 && level < 0.3) {
      return {
        type: 1,
        msgpay: '小财悄悄提醒您本月支出高于上月支出了哦'
      }
    }
    if (level <= 0 && level > -0.3) {
      return {
        type: 2,
        msgpay: '小财注意到您本月支出接近于上月支出了哦'
      }
    }
    else {
      return {
        type: 3,
        msgpay: '小财给您分析，您本月的支出情况正常，请继续保持哦'
      }
    }
  }

}

module.exports = genMessage