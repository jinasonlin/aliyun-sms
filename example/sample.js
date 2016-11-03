var SMS = require('../index');

var sms = new SMS({
  AccessKeyId: 'testid',
  AccessKeySecret: 'testsecret'
});

/**
 * 参考[https://help.aliyun.com/document_detail/44363.html]中的例子
 */
sms.send({
  Action:'SingleSendSms',
  Format:'XML',
  ParamString:'{"name":"d","name1":"d"}',
  RecNum:'13098765432',
  SignName:'标签测试',
  TemplateCode:'SMS_1650053',
}, function (error, body) {
  if (error) throw new Error(error);

  console.log(body);
});
