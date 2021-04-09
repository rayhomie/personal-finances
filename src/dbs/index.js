const mongoose = require('mongoose')
const { dbUrl } = require('./config') // 引用配置文件

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}, function () {
  console.log('connection is success')
})

module.exports = mongoose
