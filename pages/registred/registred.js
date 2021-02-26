var app = getApp()
var api = require('../../config/api.js');
var util = require('../../utils/util.js');
Page({
  data: {
    isClick: false, //获取验证码按钮，默认允许点击
    name: '', //用户名
    phone: '', //手机号
    code: '', //验证码
    res: 0, //获取验证返回信息
    btntext: '获取验证码',
    sh: false,
    content: '',
    myreg: /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}|(19[0-9]{1})))+\d{8})$/,
  },
  onLoad() {
    my.setBackgroundColor({
        backgroundColor: '#ffffff',
    })
  },
  goTo: function () {
    //收到验证码后，提交
    //判断验证码是否正确      
    if (this.data.phone == '' || this.data.phone == null) {
      util.Toast("请输入手机号");
      return;
    } else if (!this.data.myreg.test(this.data.phone)) {
      util.Toast("请输入正确的手机号");
      return;
    } else if (this.data.code == '' || this.data.code == null) {
      util.Toast("请输入验证码");
      return;
    } else if (this.data.res == 0) {
      util.Toast("请先获取验证码");
      return;
    } else if (this.data.code != this.data.res) {
      util.Toast("输入验证码不正确");
      return;
    };
    //提交
    util.request(api.RegisterUrl, {
      ali_user_id: app.globalData.openid,
      user_name: this.data.name,
      mobile_phone: this.data.phone,
      code: this.data.res
    }, 'POST', true).then(function (res) {
      console.log(res);
      if (res.data.success == true) {
        app.globalData.openid = res.data.openid;        
        app.globalData.user_id = res.data.user_id;
        app.globalData.user_name = res.data.user_name;
        my.setStorageSync({ key: "referral_code", data: res.data.referral_code });
        my.setStorageSync({ key: "is_follow_official_account", data: res.data.is_follow_official_account });
        //挑到主页面
        app.globalData.customer_info_id_list = res.data.customer_info_id_list
        my.reLaunch({
          url: '/pages/product/index/index'
        });
      } else {
        util.Toast(res.data.msg);
      }
    });
  },
  nameInput: function (e) {
    //获取输入用户名
    this.setData({
      name: e.detail.value
    })
  },
  phoneInput: function (e) {
    //获取输入手机号
    this.setData({
      phone: e.detail.value
    })
  },
  codeInput: function (e) {
    //获取输入验证码
    this.setData({
      code: e.detail.value
    })
  },
  getCode: function () {
    var that = this;
    //提示
    if (that.data.phone == '' || that.data.phone == null) {
      util.Toast("请输入手机号");
      return;
    } else if (that.data.phone.length < 11) {
      util.Toast("输入手机号长度有误");
      return;
    } else if (!that.data.myreg.test(that.data.phone)) {
      util.Toast("请输入正确的手机号");
      return;
    } else {
      //获取验证码
      var _this = this
      var coden = 60 // 定义60秒的倒计时
      _this.setData({ // _this这里的作用域不同了
        btntext: '60后重新发送',
        isClick: true,
      })
      var codeV = setInterval(function () {
        _this.setData({ // _this这里的作用域不同了
          btntext: '重新获取(' + (--coden) + 's)',
        })
        if (coden == -1) { // 清除setInterval倒计时，这里可以做很多操作，按钮变回原样等
          clearInterval(codeV)
          _this.setData({
            btntext: '获取验证码',
            isClick: false
          })
        }
      }, 1000) //  1000是1秒
      //获取验证码
      util.request(api.VerificationCodeUrl, {
        ali_user_id: app.globalData.openid,
        mobile_phone: this.data.phone,
      }, 'POST', true).then(function (res) {
        //获取验证码成功
        if (res.data.success == true) {
          //获取验证码成功
          that.setData({
            res: res.data.code
          })
        } else {
          util.Toast(res.data.msg);
        }
      })
    }
  },
  onClear() {
    this.setData({
      verifyCode: '',
    });
  },
 
});
