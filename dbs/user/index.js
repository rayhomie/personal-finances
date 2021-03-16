var mongoose = require('../index');
var User = new mongoose.Schema({ // 实列化mongoose映射
  name: String,
  age: String
});
module.exports = mongoose.model('User', User, 'user') // 创建一个mongoose对象模型
