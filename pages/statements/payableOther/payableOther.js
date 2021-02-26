var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    sumPayData: { amt_begin: 0 },
    apData: []
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    this.QueryAccountPayableOther();
  },
  /**
   * 其他应付查询
   */
  QueryAccountPayableOther: function (e) {
    let that = this;
    util.request(api.QueryAccountPayableOtherUrl, {
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {
      console.log(JSON.stringify(res), '其他应付')
      if (res.data.success == true) {
        that.setData({
          sumPayData: res.data.sumData[0],
          apData: res.data.apData
        });
      } else {
        that.setData({
          sumPayData: { amt_begin: 0 },
          apData: []
        });
      }
    })

  },
});
