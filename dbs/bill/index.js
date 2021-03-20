const mongoose = require('../index');
const moment = require('moment')
const Bill = new mongoose.Schema({ // 实列化mongoose映射
  bill_time: {
    type: String,
    trim: true,
    default: moment().format('YYYY-MM-DD HH:mm:ss'),
    required: true,
  },
  amount: {
    type: Number,
    min: 0,
    required: true,
  },
  remark: {
    type: String,
    trim: true,
  },
  user_id: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  category_id: {
    type: mongoose.Types.ObjectId,
    required: true,
  }
});

module.exports = mongoose.model('Bill', Bill, 'bill') // 创建一个mongoose对象模型
