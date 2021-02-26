var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    date: '',
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    this.setData({
      date: app.globalData.curr_date,
    });
    this.QueryAdvanceAccountReceivable();
  },
  QueryAdvanceAccountReceivable: function (e) {
    //应付账款
    let that = this;
    util.request(api.QueryAdvanceAccountReceivableUrl, {
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {
      if (res.data.success == true) {

        that.setData({
          sumAccountReceivableData: res.data.sumData[0],
          amt_end: util.priceSwitch(res.data.sumData[0].amt_end),
          arData: res.data.arData
        });
      } else {
        that.setData({
          sumAccountReceivableData: { amt_end: '0.00' },
          amt_end: '0.00',
          arData:[]
        });
      }
    })
  },
});
