var mongoose = require('../index');
var User = new mongoose.Schema({ // 实列化mongoose映射
  username: {
    type: String,
    trim: true,// 自动给name字段的内容去掉左右空格
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar_url: String,
  gender: {
    type: Number,
    default: 1,
    required: true,
  },
  mobile_number: String,
});
module.exports = mongoose.model('User', User, 'user') // 创建一个mongoose对象模型
