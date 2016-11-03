# 阿里云短信服务 for Nodejs

```bash
    npm install jinasonlin/aliyun-sms
```

```js
var SMS = require('aliyun-sms');

var sms = new SMS({
  AccessKeyId: 'testid',
  AccessKeySecret: 'testsecret'
});

sms.send({
  /**
   * example/sample
   */
}, function (error, body) {
  if (error) throw new Error(error);

  console.log(body);
});
```

