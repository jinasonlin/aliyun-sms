var crypto = require('crypto');
var _ = require('lodash');
var request = require('request');

var required = [
  'Action',
  'SignName',
  'TemplateCode',
  'RecNum',
  'ParamString',
];

var SMS = function (config) {
  config = config ? config : {};

  this.AccessKeyId = config.AccessKeyId;
  this.AccessKeySecret = config.AccessKeySecret;
  if (!this.AccessKeyId) {
    throw new Error('missing AccessKeyId');
  }
  if (!this.AccessKeySecret) {
    throw new Error('missing AccessKeySecret');
  }
  this.Format = config.Format || 'JSON';
  this.Version = config.Version || '2016-09-27';
  this.SignatureMethod = config.SignatureMethod || 'HMAC-SHA1';
  this.SignatureVersion = config.SignatureVersion || '1.0';
};

SMS.prototype.send = function(params, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (!options) {
    options = options || {};
  }

  var method = options.method || 'POST';
  params = _.assign(this._getDefaults(), params);
  for (var key in params) {
    if(params[key] !== undefined && params[key] !== null){
      params[key] = params[key].toString();
    }
  }

  var missing = [];
  required.forEach(function(key) {
    var alters = key.split('|');
    for (var i = alters.length - 1; i >= 0; i--) {
      if (params[alters[i]]) {
        return;
      }
    }
    missing.push(key);
  });
  if (missing.length) {
    return callback === 'function' && callback('missing params ' + missing.join(','));
  }

  params.Signature = this._getSignature(params, method);

  var requestParams = {
    method: method,
    url: 'http://sms.aliyuncs.com/'
  };

  if (method === 'GET') {
    requestParams.headers = {
      'cache-control': 'no-cache'
    };
    requestParams.qs = params;
  } else if (method === 'POST') {
    requestParams.headers = {
      'cache-control': 'no-cache',
      'content-type': 'application/x-www-form-urlencoded'
    };
    requestParams.form = params;
  } else {
    return callback === 'function' && callback('request params error');
  }

  request(requestParams, function (error, response, body) {
    if (params.Format === 'JSON') {
      body = JSON.parse(body);
    }
    typeof callback === 'function' && callback(error, body);
  });
};

SMS.prototype._getDefaults = function () {
  var defaults = {
    Format: this.Format,
    Version: this.Version,
    AccessKeyId: this.AccessKeyId,
    SignatureMethod: this.SignatureMethod,
    Timestamp: this._generateTimestamp(),
    SignatureVersion: this.SignatureVersion,
    SignatureNonce: this._generateSignatureNonce()
  };
  return defaults;
};

SMS.prototype._getSignature = function (pkg, method) {
  pkg = _.clone(pkg);
  delete pkg.Signature;
  var string = encodeURIComponent(this._toQueryString(pkg));
  string = method + '&' + encodeURIComponent('/') + '&' + string;
  // only HMAC-SHA1
  var stringToSign = crypto.createHmac('sha1', this.AccessKeySecret + '&').update(string).digest('base64');
  return encodeURIComponent(stringToSign);
};

SMS.prototype._toQueryString = function (object) {
  return Object.keys(object).filter(function (key) {
    return object[key] !== undefined && object[key] !== '';
  }).sort().map(function (key) {
    // TODO isUTF
    if (~['ParamString', 'SignName', 'Timestamp'].indexOf(key)) {
      return key + '=' + encodeURIComponent(object[key]);
    } else {
      return key + '=' + object[key];
    }
  }).join('&');
};

SMS.prototype._generateTimestamp = function () {
  return new Date().toISOString();
};

SMS.prototype._generateSignatureNonce = function (length) {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var maxPos = chars.length;
  var noceStr = '';
  var i;
  for (i = 0; i < (length || 32); i++) {
    noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return noceStr;
};

module.exports = SMS;
