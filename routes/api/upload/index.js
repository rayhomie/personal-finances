const router = require('koa-router')()
const OSS = require('ali-oss');
const moment = require('moment')

const client = new OSS({
  region: 'oss-cn-chengdu',
  accessKeyId: 'LTAI5tALXBEYXwDqEprXEqDT',
  accessKeySecret: 'jqFq4W8l8jj4KUH1jMDzewg8vZpFQm',
  bucket: 'personal-financ'
});

// 上传图片到oss
router.post('/picture', async (ctx, next) => {
  const data = ctx.request.body
  console.log(data._parts[0]);

  var options = {
    // progress: progress,	//可以拿到文件上传进度；用于写进度条
    partSize: 500 * 1024,
    meta: {
      people: 'rayhomie'
    },
    timeout: 60000,
  }
  //objectKey, file, options三个参数分别是：objectKey阿里云上buket中的虚拟文件地址（String）；file是读取的文件，注意这里是一个文件；options见上定义的options
  const res = await client.multipartUpload(
    `${moment().format('YYYYMMDDHHmmss.png')}`,
    data._parts[0][1].path,
    options)
  if (res.res.status === 200 && res.res.statusMessage === 'OK') {
    ctx.body = { res: res.res, code: 0 }
  } else {
    ctx.body = { err: res.res, code: 1, info: '上传失败' }
  }


})

module.exports = router.routes()