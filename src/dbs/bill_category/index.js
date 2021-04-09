var mongoose = require('../index');
var Bill_category = new mongoose.Schema({ // 实列化mongoose映射
  name: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  id: {
    type: String,
    trim: true,
    unique: true,
  },
  icon_n: {
    type: String,
    trim: true,
    required: true,
  },
  icon_l: {
    type: String,
    trim: true,
    required: true,
  },
  icon_s: {
    type: String,
    trim: true,
    required: true,
  },
  is_income: {
    type: Number,
    default: 0,
    required: true,
  },
  is_system: {
    type: Number,
    default: 0,
    required: true,
  },
  user_id: {
    type: mongoose.Types.ObjectId,
  }
});
module.exports = mongoose.model('Bill_category', Bill_category, 'bill_category') // 创建一个mongoose对象模型
