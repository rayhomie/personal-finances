const genMessage = (totalArr) => {
  /*
  (收入-支出)/收入
  0.x>=70%,您收到小财的表扬啦，您本月的收支情况保持的超棒哦，您余下了的钱可以购买理财产品、基金等投资哦。财务自由离您更近一步哦。
  1.70%>x>30%,正常（小财给您分析，您本月的收支情况正常，请继续保持哦）
  2.0<x<=30%,阈值提醒：小财悄悄提醒您，您的本月可能会存在超支的风险哦
  3.x<=0,已经超支
  4.x=<-30%，已超支30%再次提示
  */
  if (totalArr[1] === 0) {
    return {
      type: 3, curmsg: '小财看到您已经超支啦，请注意财务情况哦'
    }
  }
  if (totalArr[1] !== 0) {
    const level = (totalArr[1] - totalArr[0]) / totalArr[1]
    if (level >= 0.7) {
      return {
        type: 0,
        curmsg: '您收到小财的表扬啦，您本月的收支情况保持的超棒哦，您余下了的钱可以购买理财产品、基金等投资哦。财务自由离您更近一步哦。'
      }
    }
    if (0.7 > level && level > 0.3) {
      return {
        type: 1, curmsg: '小财给您分析,您本月的收支情况正常，请继续保持哦'
      }
    }
    if (level > 0 && level < 0.3) {
      return {
        type: 2, curmsg: '小财悄悄提醒您，您的本月可能会存在超支的风险哦'
      }
    }
    if (level <= 0 && level > -0.3) {
      return {
        type: 3, curmsg: '小财看到您已经超支啦，请注意财务情况哦'
      }
    }
    else {
      return {
        type: 4, curmsg: '小财再次提醒您，已超支30%了，要破产了哦'
      }
    }
  }

}


module.exports = genMessage