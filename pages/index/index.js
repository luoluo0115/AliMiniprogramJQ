const app = getApp()
var api = require('../../config/api.js');
var util = require('../../utils/util.js');
Page({
  data: {
    motto: '欢迎来到巧记账',
    userInfo: {},
    hasUserInfo: false,
    canIUse: my.canIUse('button.open-type.getAuthorize'),
    loginBg: api.ImgUrl + 'A014',//A003
    goPage: '',
    goUrl: '',
  },
  /**
   *  获取系统信息
   */
  getSystemInfo: function () {
    let systemInfo;
    my.getSystemInfo({
      success: function (res) {
        systemInfo = res;
        console.log(res, '设备信息')
      }
    })
    return systemInfo;
  },

  onLoad(options) {    
    //获取分享推荐码
    var parent_referral_code = options.referral_code;
    if (parent_referral_code != undefined && parent_referral_code != null && parent_referral_code != "") {      
      my.setStorageSync({ key: "parent_referral_code", data: parent_referral_code });  
    }

    //跳转指定页面
    if (options.goPage) {
      let goPage = decodeURIComponent(options.goPage);
      let cid = decodeURIComponent(options.cid);
      let cdate = decodeURIComponent(options.cdate);
      let url = "/pages/product/index/index";
      if (goPage == 1) {
        url = "/pages/home/taxPayable/taxPayable?cid=" + cid + "&cdate=" + cdate;
      }
      this.setData({
        goPage: goPage,
        goUrl: url,
      })
    }
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      var userInfo = my.getStorageSync({ key: 'userInfo' }).data;      
      console.log(userInfo, 'userInfo')
      if (userInfo) {
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // my.getOpenUserInfo({
      //   fail: (res) => {
      //   },
      //   success: (res) => {
      //     let userInfo = JSON.parse(res.response).response;// 以下方的报文格式解析两层 response        
      //     app.globalData.userInfo = userInfo;
      //     that.setData({
      //       userInfo: userInfo,
      //       hasUserInfo: true
      //     })            
      //   },
      // });
    }

  },
  getAuthCode: function () {
    var that = this;
    my.getAuthCode({
      scopes: 'auth_user', // 主动授权（弹框）：auth_user，静默授权（不弹框）：auth_base
      success: (res) => {
        var systemInfo = that.getSystemInfo();
        var authCode = res.authCode
        var data = {
          authCode: authCode,
          systemInfo: JSON.stringify(systemInfo)
        }
        util.request(api.UserUrl, data, 'POST', true).then(function (res) {
          console.log(res);
          if (res.data.success == true) {
            app.globalData.openid = res.data.openid;
            app.globalData.sessKey = res.data.session_key;
            app.globalData.user_id = res.data.user_id;
            app.globalData.user_name = res.data.user_name;
            my.setStorageSync("referral_code", res.data.referral_code);
            my.setStorageSync("is_follow_official_account", res.data.is_follow_official_account);
            if (!res.data.isRegister) {
              my.reLaunch({
                url: '../registred/registred'
              });
            } else {
              app.globalData.customer_info_id_list = res.data.customer_info_id_list
              if (that.data.goPage == 1) {
                my.reLaunch({
                  url: that.data.goUrl
                });
              } else {
                my.reLaunch({
                  url: '/pages/product/index/index'
                });
              }
            }
          } else {
            util.Toast(res.data.msg);
          }
        })
      },
    });
  },
  /**
   * 授权成功事件
   */
  onGetAuthorize(res) {
    let that = this;
    my.getOpenUserInfo({
      fail: (res) => {
      },
      success: (res) => {
        let userInfo = JSON.parse(res.response).response // 以下方的报文格式解析两层 response        
        app.globalData.userInfo = userInfo;
        that.setData({
          userInfo: userInfo,
        })
        my.setStorageSync({ key: "userInfo", data: userInfo });
        that.login();
        // my.reLaunch({
        //   url: '/pages/product/index/index'
        // });
      },
    });
  },
  /**
  * 授权失败事件  
  */
  onAuthError(e) {
    util.Toast('拒绝授权');
  },
  onGetAuthorize2: function (res) {
    var _this = this;
    /* 获取基本信息 */
    console.log('同意授权');
    // my.showLoading({
    //   title: '正在登陆！'
    // });
    console.log(res);
    my.getAuthCode({
      scopes: ['auth_user'],
      success: function success(res) {
        /* 支付宝小程序弹窗 */
        // my.alert({
        //  content: res.authCode
        // });
        if (res.authCode) {
          let authCode = res.authCode;
          my.getOpenUserInfo({
            fail: function fail(res) { },
            success: function success(res) {
              // console.log(res);
              var userInfo = JSON.parse(res.response).response; // 以下方的报文格式解析两层 response
              console.log(userInfo, 'userInfo');
              var gender = '';
              if (userInfo.gender == 'm') {
                gender = '1';
              } else {
                gender = '2';
              }
              var postData = {
                avatarUrl: userInfo.avatar,
                nickName: userInfo.nickName,
                gender: gender,
                province: userInfo.province,
                city: userInfo.city,
                country: userInfo.countryCode
              };

              // 认证成功
              // 调用自己的服务端接口，让服务端进行后端的授权认证，并且利用session，需要解决跨域问题
              var url = "http://localhost:5702/api";
              my.request({
                url: url + '/AliMiniProgram/CheckAlipayCode', // 该url是您自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
                data: {
                  authCode: authCode,
                  userInfo: JSON.stringify(postData),
                },
                method: 'POST',
                headers: {
                  'content-type': 'application/json'
                },
                dataType: 'json',
                success: function success(res) {
                  console.log(res);
                  var data = res.data;
                  if (data.state == 3) {

                    // 授权成功并且服务器端登录成功

                  } else if (data.start != 4) {
                    _this.setStorage('memberId', data.memberId);
                    /* 调用父组件方法跳转回去 */
                    _this.$emit('jump');
                    _this.isLogIn = true;
                    var logins = {};
                    logins.nickName = data.nickname;
                    logins.avatar = data.userHeadImage;
                    _this.setStorage('login', logins);
                    var n = _this.getStorage('login').nickName;
                    console.log(n, 'n');
                    _this.nickName = _this.getStorage('login').nickName;
                    _this.avatarUrl = _this.getStorage('login').avatar;
                    _this.setStorage('openId', data.openid);
                    _this.setStorage('accessToken', data.accessToken);
                  }
                  my.hideLoading();
                },
                fail: function fail() {
                  // 根据自己的业务场景来进行错误处理
                  my.hideLoading();
                  my.showToast({
                    icon: 'none',
                    title: '登陆失败',
                    mask: true
                  });
                }
              });
            }
          });
        }
      },
      fail: function fail(res) {
        my.hideLoading();
        my.showToast({
          icon: 'none',
          title: '登陆失败',
          mask: true
        });
      }
    });
  },
  onReady() {
    // 页面加载完成
    this.login();
  },
  login: function () {
    let that = this;
    my.getSetting({
      success: res => {
        if (res.authSetting['userInfo']) {
          //已经授权，获取用户信息
          my.getOpenUserInfo({
            fail: (res) => {
            },
            success: function (res) {
              let userInfo = JSON.parse(res.response).response;
              var gender = '';
              if (userInfo.gender == 'm') {
                gender = '1';
              } else {
                gender = '2';
              }
              userInfo.gender = gender;
              console.log(userInfo,'userInfo')
              app.globalData.userInfo = userInfo;
              that.setData({
                userInfo: userInfo,
              })
              my.setStorageSync({ key: "userInfo", data: userInfo });
              my.getAuthCode({
                scopes: ['auth_base'],
                success: res => {
                  if (res.authCode) {
                    var authCode = res.authCode
                    var systemInfo = that.getSystemInfo();
                    var data = {
                      authCode: authCode,
                      userInfo: JSON.stringify(userInfo),
                      systemInfo: JSON.stringify(systemInfo)
                    }
                    util.request(api.UserUrl, data, 'POST', true).then(function (res) {
                      console.log(res);
                      if (res.data.success == true) {
                        app.globalData.openid = res.data.ali_user_id;
                        app.globalData.access_token = res.data.access_token;
                        app.globalData.user_id = res.data.user_id;
                        app.globalData.user_name = res.data.user_name;
                        my.setStorageSync({ key: "referral_code", data: res.data.referral_code });
                        my.setStorageSync({ key: "is_follow_official_account", data: res.data.is_follow_official_account });                         
                        if (!res.data.isRegister) {
                          my.reLaunch({
                            url: '../registred/registred'
                          });
                        } else {
                          app.globalData.customer_info_id_list = res.data.customer_info_id_list
                          if (that.data.goPage == 1) {
                            my.reLaunch({
                              url: that.data.goUrl
                            });
                          } else {
                            my.reLaunch({
                              url: '/pages/product/index/index'
                            });
                          }
                        }
                      } else {
                        util.Toast(res.data.msg);
                      }
                    })

                  } else {
                    console.log('登录失败！' + res.errMsg)
                  }
                }
              });
            }
          })
        } else {
          //用户未授权
          this.setData({
            hasUserInfo: false
          })
        }
      }
    })

  },
  onShow() {
    // 页面显示
  },
  onHide() {
    // 页面隐藏
  },
  onUnload() {
    // 页面被关闭
  },
  onTitleClick() {
    // 标题被点击
  },
  onPullDownRefresh() {
    // 页面被下拉
  },
  onReachBottom() {
    // 页面被拉到底部
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: '巧记账',
      desc: '巧记账',
      path: 'pages/index/index',
    };
  },

});
