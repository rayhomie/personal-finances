const router = require('koa-router')()
const OSS = require('ali-oss');
const moment = require('moment')
const oss = require('../../../../oss')
const client = new OSS(oss);
/*
  {
    region: 'oss-cn-xxxxx',
    accessKeyId: 'xxxxxxxxxxxxxxx',
    accessKeySecret: 'xxxxxxxxxxxx',
    bucket: 'xxxxxxxxxx'
  }
*/
// 上传图片到oss
router.post('/picture', async (ctx, next) => {
  console.log(
    ctx.request,
    ctx.request.files,
  );

  var options = {
    // progress: progress,	//可以拿到文件上传进度；用于写进度条
    // partSize: 500 * 1024,
    meta: {
      people: 'rayhomie'
    },
    timeout: 60000,
  }
  //objectKey, file, options三个参数分别是：objectKey阿里云上buket中的虚拟文件地址（String）；file是读取的文件，注意这里是一个文件；options见上定义的options
  const res = await client.multipartUpload(
    `${moment().format('YYYYMMDDHHmmss.png')}`,
    ctx.request.files.image.path,
    options)
  if (res.res.status === 200 && res.res.statusMessage === 'OK') {
    ctx.body = { res: res.res, code: 0 }
  } else {
    ctx.body = { err: res.res, code: 1, info: '上传失败' }
  }


})

module.exports = router.routes()