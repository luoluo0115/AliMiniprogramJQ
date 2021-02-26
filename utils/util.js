var api = require('../config/api.js')
var utilMd5 = require('../utils/md5.js');
const app = getApp();
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
};

const formatYear = date => {
  var date = new Date;
  var year = date.getFullYear();

  return year
};
const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1

  return [year, month].map(formatNumber).join('-') + ' '
};

const formatDataTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
};
const dateFormatStr = function (dateStr) {
  if (dateStr == null) {
    return '';
  }
  return dateStr.replace('T', ' ')
}
//上个月
const LastMonth = function () {
  var date = new Date;
  var year = date.getFullYear();
  var month = date.getMonth();
  if (month == '0') {
    year = date.getFullYear() - 1;
    month = 12;
  }
  return [year, month].map(formatNumber).join('-')


}
//上个月
const Month = function () {
  var date = new Date;
  var month = date.getMonth();
  return month

}
const priceSwitch = function (val) {
  //金额转换  并每隔3位用逗号分开 1,234.56
  var str = (val * 100 / 100).toFixed(2) + '';
  var intSum = str.substring(0, str.indexOf(".")).replace(/\B(?=(?:\d{3})+$)/g, ','); //取到整数部分
  var dot = str.substring(str.length, str.indexOf(".")) //取到小数部分搜索
  var ret = intSum + dot;
  return ret;
}

const formatDateUnderLine = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('_')
}
const yymmdd = formatDateUnderLine(new Date());
const md5key = utilMd5.hexMD5('COMMON_TOKEN_' + yymmdd).toUpperCase();

function request(url, data = {}, method = "POST", checkLogin = false) {
  return new Promise(function (resolve, reject) {
    var that = this;
    var qh_access_token = "";
    //需要验证Bearer token
    my.request({
      url: api.TokenUrl + md5key,
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      method: "get",
      dataType: "json",
      success: function (res) {
        qh_access_token = res.data.token;
        //console.log("api-token:" + qh_access_token);        
        my.setStorageSync({ key: "qh_access_token", data: qh_access_token });
        getApp().globalData.Token = res.data.token;

        if (checkUserId() || checkLogin) {

          my.request({
            url: url,
            data: data,
            method: method,
            headers: {
              'content-type': 'application/json', // 默认值,
              'Authorization': 'Bearer ' + qh_access_token //设置验证
            },
            dataType: "json",
            success: function (res) {
              resolve(res);
            },
            fail: function (res) {
              console.warn('--- request fail >>>');
              console.warn(res);
              console.warn('<<< request fail ---');
              var app = getApp();
              if (app.is_on_launch) {
                app.is_on_launch = false;
                my.confirm({
                  title: "网络请求出错",
                  content: res.errorMessage,
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      reject(res);
                    }
                  }
                });
              } else {
                my.showToast({
                  content: res.errorMessage,
                  type: 'exception',
                });
                reject(res);
              }
            },
            complete: function (res) {
              if (res.status != 200) {
                console.log('--- request http error >>>');
                console.log(res.status);
                console.log(res.data);
                console.log('<<< request http error ---');
              }
              reject(res);
            }
          });

        } else {
          my.reLaunch({
            url: '/pages/index/index'
          });
        }
      },
      fail: function (res) {
        Toast('网络异常');
        console.log(res);
      },
      complete: function (res) {
        if (res.status != 200) {
          console.log('--- request http error >>>');
          console.log(res.status);
          console.log(res.data);
          console.log('<<< request http error ---');
        }
      }
    });
  })
}

function commonRequest(object) {
  var that = this;
  if (!object.data) {
    object.data = {};
  }
  var qh_access_token = "";

  //需要验证Bearer token
  my.request({
    url: api.TokenUrl + getApp().md5Key,
    header: {
      'content-type': 'application/x-www-form-urlencoded' // 默认值
    },
    method: "get",
    dataType: "json",
    success: function (res) {
      qh_access_token = res.data.token;

      my.setStorageSync({ key: "qh_access_token", data: qh_access_token });
      var qh_access_token_time = formatTime(new Date());
      my.setStorageSync({ key: "qh_access_token_time", data: qh_access_token_time });

      postRequest(object, qh_access_token);


    },
    fail: function (res) {
      console.log(res.error);
    }
  });
}

function postRequest(object, qh_access_token) {
  my.showLoading({
    content: "加载中……",
    mask: true,
  });

  my.request({
    url: object.url,
    headers: object.header || {
      'content-type': 'application/json', // 默认值,
      'Authorization': 'Bearer ' + qh_access_token //设置验证
    },
    data: object.data || {},
    method: object.method || "GET",
    dataType: object.dataType || "json",
    success: function (res) {
      //is_VerifyLogin
      //getApp().checkOpenId();
      if (res.data.code == -1) {
        //getApp().login();
      } else {
        if (object.success)
          object.success(res);
      }
    },
    fail: function (res) {
      console.warn('--- request fail >>>');
      console.warn(res);
      console.warn('<<< request fail ---');
      var app = getApp();
      if (app.is_on_launch) {
        app.is_on_launch = false;
        my.confirm({
          title: "网络请求出错",
          content: res.errorMessage,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              if (object.fail)
                object.fail(res);
            }
          }
        });
      } else {
        my.showToast({
          title: res.errorMessage,
          type: 'exception'
        });
        if (object.fail)
          object.fail(res);
      }
    },
    complete: function (res) {
      my.hideLoading();
      if (res.status != 200) {
        console.log('--- request http error >>>');
        console.log(res.status);
        console.log(res.data);
        console.log('<<< request http error ---');
      }
      if (object.complete)
        object.complete(res);
    }
  });

}

function requestV2(url, data = {}, method = "POST", checkLogin = false) {
  return new Promise(function (resolve, reject) {
    var that = this;

    var qh_access_token = "";
    var qh_access_token_time = "";
    qh_access_token = my.getStorageSync({ key: 'qh_access_token' }).data;
    qh_access_token_time = my.getStorageSync({ key: 'qh_access_token_time' }).data;
    var total_minutes = 0;
    if (qh_access_token_time != "" && qh_access_token_time != null && qh_access_token_time != undefined) {

      var date_qh_access_token_time = new Date(qh_access_token_time); //token缓存时间
      var now_time = new Date().getTime(); //当前时间
      var diff = now_time - date_qh_access_token_time; //求时间差
      total_minutes = diff / (1000 * 60);
      console.log('缓存token的时间：' + qh_access_token_time);
      console.log('当前时间差：' + total_minutes);
    }
    var need_reload = "N";
    if (qh_access_token == undefined || qh_access_token == null || qh_access_token == '') {
      need_reload = "Y";
    } else {
      if (total_minutes > 110) {
        need_reload = "Y";
      }
    }
    //需要验证Bearer token
    if (need_reload == "Y") {
      my.request({
        url: api.TokenUrl + md5key,
        headers: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        method: "get",
        dataType: "json",
        success: function (res) {
          qh_access_token = res.data.token;
          my.setStorageSync('qh_access_token', qh_access_token);
          var qh_access_token_time = formatTime(new Date());
          my.setStorageSync({ key: "qh_access_token_time", data: qh_access_token_time });
          my.setStorageSync({ key: "qh_access_token", data: qh_access_token });

          getApp().globalData.Token = res.data.token;

          my.request({
            url: url,
            data: data,
            method: method,
            headers: {
              'content-type': 'application/json', // 默认值,
              'Authorization': 'Bearer ' + qh_access_token //设置验证
            },
            dataType: "json",
            success: function (res) {
              resolve(res);
            },
            fail: function (res) {
              console.warn('--- request fail >>>');
              console.warn(res);
              console.warn('<<< request fail ---');
              var app = getApp();
              if (app.is_on_launch) {
                app.is_on_launch = false;
                my.confirm({
                  title: "网络请求出错",
                  content: res.errorMessage,
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      reject(res);
                    }
                  }
                });
              } else {
                my.showToast({
                  content: res.errorMessage,
                  type: 'exception',
                });
                reject(res);
              }



            },
            complete: function (res) {
              if (res.status != 200) {
                console.log('--- request http error >>>');
                console.log(res.status);
                console.log(res.data);
                console.log('<<< request http error ---');
              }
              //reject(res);
            }
          });

        },
        fail: function (res) {
          console.log(res.error);
        }
      });

    } else {
      my.request({
        url: url,
        data: data,
        method: method,
        headers: {
          'content-type': 'application/json', // 默认值,
          'Authorization': 'Bearer ' + qh_access_token //设置验证
        },
        dataType: "json",
        success: function (res) {
          resolve(res);
        },
        fail: function (res) {
          console.warn('--- request fail >>>');
          console.warn(res);
          console.warn('<<< request fail ---');
          var app = getApp();
          if (app.is_on_launch) {
            app.is_on_launch = false;
            my.confirm({
              title: "网络请求出错",
              content: res.errMsg,
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  reject(res);
                }
              }
            });
          } else {
            my.showToast({
              content: res.errMsg,
              type: 'exception'
            });
            reject(res);
          }
        },
        complete: function (res) {
          if (res.status != 200) {
            console.log('--- request http error >>>');
            console.log(res.status);
            console.log(res.data);
            console.log('<<< request http error ---');
          }
          reject(res);
        }
      });
    }
  }).catch((e) => { });
}


function Toast(content, type = 'none') {
  if (type != 'none') {
    my.showToast({
      type: type,
      content: content,
      duration: 2000,
    });
  } else {
    my.showToast({
      type: 'none',
      content: content,
      duration: 3000,
    });
  }
}

function checkUserId() {
  var app = getApp();
  var openid = app.globalData.openid;
  var user_id = app.globalData.user_id;
  if (user_id != "" && user_id != null && user_id != undefined) {
    return true;
  } else {
    return false;
  }
}

function checkOpenId() {
  var openid = my.getStorageSync("openid").data;
  var user_id = my.getStorageSync("user_id").data;
  if (user_id != "" && user_id != null && user_id != undefined) {
    return true;
  } else {
    return false;
  }
}

function get(url, data = {}) {
  return request(url, data, 'GET')
}

function post(url, data = {}) {
  return request(url, data, 'POST')
}

/**
 * 调用微信登录
 */
function login() {
  return new Promise(function (resolve, reject) {
    my.getAuthCode({
      scopes: ['auth_base'],
      success: function (res) {
        if (res.code) {
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail: function (err) {
        reject(err);
      }
    });
  });
}

function getUserInfo() {
  return new Promise(function (resolve, reject) {
    my.getOpenUserInfo({
      success: function (res) {
        console.log(res)
        let userInfo = JSON.parse(res.response).response // 以下方的报文格式解析两层 response
        if (userInfo.code == '10000') {
          resolve(userInfo);
        } else {
          reject(userInfo)
        }
      },
      fail: function (err) {
        reject(err);
      }
    })
  }).catch((e) => { });
}

/**
 * 执行请求，禁止多次点击或者重复点击
 */
function showLoading(message) {
  if (my.showLoading) {
    my.showLoading({
      title: message,
      mask: true
    });
  }
}

function hideLoading() {
  if (my.hideLoading) {
    my.hideLoading();
  }
}

module.exports = {
  dateFormatStr: dateFormatStr,
  formatTime: formatTime,
  formatDate: formatDate,
  formatDataTime: formatDataTime,
  LastMonth: LastMonth,
  Month: Month,
  priceSwitch: priceSwitch,
  request: request,
  formatDateUnderLine: formatDateUnderLine,
  showLoading: showLoading,
  hideLoading: hideLoading,
  formatYear: formatYear,
  Toast: Toast,
  checkOpenId: checkOpenId
}