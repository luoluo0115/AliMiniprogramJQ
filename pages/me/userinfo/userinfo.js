var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    userInfo: [],
    custList: [],
    showEmail: false,
    email: '',
    smscode: '',
    btntext: '获取验证码',
    isClick: false, //获取验证码按钮，默认允许点击
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.QueryUserInfo();
    this.QueryVerifyCustList();
  },
  goEmail: function () {
    this.setData({
      showEmail: true
    })
  },
  onClose() {
    this.setData({
      close: false
    });
  },

  emailInput: function (e) {
    //获取输入邮箱号
    this.setData({
      email: e.detail.value
    })
  },
  codeInput: function (e) {
    //获取输入验证码
    this.setData({
      smscode: e.detail.value
    })
  },
  /**
   * 获取验证码
   */
  getCode: function () {
    let that = this;
    let emailreg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
    //提示
    if (that.data.email == '' || that.data.email == null) {
      util.Toast("请输入邮箱号");
      return;
    } else if (!emailreg.test(that.data.email)) {
      util.Toast("邮箱号格式不正确");
      return;
    } else {
      //获取验证码
      var _this = this
      var coden = 180 // 定义60秒的倒计时
      _this.setData({ // _this这里的作用域不同了
        btntext: '180后重新发送',
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
      util.request(api.PostVerifyUser, {
        openid: app.globalData.openid,
        user_email: that.data.email,
        user_id: app.globalData.user_id,
        user_name: app.globalData.user_name
      }, 'POST', true).then(function (res) {
        //获取验证码成功
        that.setData({
          syscode: res.data.code
        })
      })
    }
  },
  /**
   * 确认
   */
  confirm: function (event) {
    let emailreg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
    if (this.data.email == '' || this.data.email == null) {
      this.setData({
        showEmail: true,
      })
      util.Toast("请输入邮箱号");
      return;
    } else if (!emailreg.test(this.data.email)) {
      this.setData({
        showEmail: true,
      })
      util.Toast("邮箱号格式不正确");
      return;
    };
    if (this.data.smscode == '' || this.data.smscode == null) {
      this.setData({
        showEmail: true,
      })
      util.Toast("请输入验证码");
      return;
    };
    //提交
    util.request(api.SaveVerifyCode, {
      openid: app.globalData.openid,
      user_name: app.globalData.user_name,
      user_id: app.globalData.user_id,
      user_email: this.data.email,
      code: this.data.smscode,
    }, 'POST', true).then(function (res) {
      if (res.data.success) {
        my.redirectTo({
          url: '/pages/me/userinfo/userinfo',
        });
        util.Toast(res.data.msg, 'success');
      } else {
        this.setData({
          showEmail: true,
        })
        util.Toast(res.data.msg, 'fail');
      }
    });
  },

  QueryUserInfo: function () {
    let that = this;
    util.request(api.QueryUserInfo, {
      openid: app.globalData.openid,
      cid: app.globalData.curr_customer_info_id,
      user_id: app.globalData.user_id
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        var userInfo = JSON.stringify(res.data.customerList[0]);
        that.setData({
          userInfo: res.data.customerList[0]
        });
      } else {
        that.setData({
          userInfo: []
        });
      }
    })
  },
  /**
   * 个人申请公司列表
   */
  QueryVerifyCustList: function () {
    let that = this;
    util.request(api.QueryVerifyCustListUrl, {
      openid: app.globalData.openid,
      ui: app.globalData.user_id,
      cname: app.globalData.curr_customer_name
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        that.setData({
          custList: res.data.dataList,
        });
      } else {
        that.setData({
          custList: [],
        });

      }
    })

  },
  /**
* 用户点击右上角分享
*/
  onShareAppMessage: function () {
    let user_id = app.globalData.user_id
    let referral_code = my.getStorageSync({key:'referral_code'}).data;
    return {
      title: '巧记账',
      desc: '巧记账',
      path: '/pages/index/index?referral_code=' + referral_code + '&user_id=' + user_id,
    }
  }
});
