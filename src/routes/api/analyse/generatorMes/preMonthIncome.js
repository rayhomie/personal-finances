const genMessage = (curArr, preArr) => {
  /*
    （这月收入-上月收入）/上月收入
    0.x>=0.3 小财恭喜老板，财源滚滚，收入步步高，相较于上月有明显增长
    1.0.3>x>0 小财观察到您的收入已经超过上月了哦，加油
    2.0>=x>-0.3 小财了解到收入情况稍低于上月，加油
    3.其他 正常
  */
  if (preArr[1] === 0) {
    return { type: 3, msgincome: '小财给您分析，您本月的收入情况正常，请继续保持哦' }
  }
  if (preArr[1] !== 0) {
    const level = (curArr[1] - preArr[1]) / preArr[1]
    if (level >= 0.3) {
      return {
        type: 0,
        msgpay: '小财恭喜老板，财源滚滚，收入步步高，相较于上月有明显增长'
      }
    }
    if (level > 0 && level < 0.3) {
      return {
        type: 1,
        msgpay: '小财观察到您的收入已经超过上月了哦，加油'
      }
    }
    if (level <= 0 && level > -0.3) {
      return {
        type: 1,
        msgpay: '小财了解到收入情况稍低于上月，加油'
      }
    }
    else {
      return {
        type: 3,
        msgpay: '小财给您分析，您本月的收入情况正常，请继续保持哦'
      }
    }
  }
}

module.exports = genMessage