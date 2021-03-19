var mongoose = require('../index');
var Bill_category = new mongoose.Schema({ // 实列化mongoose映射
  title: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  icon: {
    type: String,
    trim: true,
    required: true,
  },
  isIncome: {
    type: Number,
    default: 0,
    required: true,
  }
});
module.exports = mongoose.model('Bill_category', Bill_category, 'bill_category') // 创建一个mongoose对象模型
