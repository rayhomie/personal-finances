var mongoose = require('../index');
var Budget = new mongoose.Schema({ // 实列化mongoose映射
    create_time: {
        type: Number,
        required: true,
    },
    budget_value: {
        type: Number,
        required: true,
    },
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
});
module.exports = mongoose.model('Budget', Budget, 'budget') // 创建一个mongoose对象模型
