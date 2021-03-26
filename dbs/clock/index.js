var mongoose = require('../index');
var Clock = new mongoose.Schema({ // 实列化mongoose映射
    clock_date: {
        type: Number,
        trim: true,
        unique: true,
        required: true,
    },
});
module.exports = mongoose.model('Clock', Clock, 'clock') // 创建一个mongoose对象模型
