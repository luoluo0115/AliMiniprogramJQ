var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    sumData: { amt_end: 0 },
    arData: []
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.QueryAccountReceivableOther();
  },
  /**
   * 其他应收查询
   */
  QueryAccountReceivableOther: function (e) {
    let that = this;
    util.request(api.QueryAccountReceivableOtherUrl, {
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {
      console.log(JSON.stringify(res), '其他应付')
      if (res.data.success == true) {
        that.setData({
          sumData: res.data.sumData[0],
          arData: res.data.arData
        });
      } else {
        that.setData({
          sumData: { amt_end: 0 },
          arData: []
        });
      }
    })
  },
});
