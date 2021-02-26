var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    date: '',
    dt: []
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    this.setData({
      date: app.globalData.curr_date,
    });
    this.QueryBankCashDetail();
  },
  QueryBankCashDetail: function (e) {
    //应付账款
    let that = this;
    util.request(api.QueryBankCashDetailUrl, {
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        that.setData({
          dt: res.data.dt,
        });
      } else {
        that.setData({
          dt: []
        });
      }
    })

  },
});
