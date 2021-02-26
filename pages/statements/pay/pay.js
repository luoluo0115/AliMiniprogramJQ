var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    date: '',
    sumPayData: { amt_end: '0.00' },
    amt_end: '0.00',
    apData: []
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    this.setData({
      date: app.globalData.curr_date,
    });
    this.QueryAccountPayable();
  },
  QueryAccountPayable: function (e) {
    //应付账款
    let that = this;
    util.request(api.QueryAccountPayableUrl, {
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {

      if (res.data.success == true) {

        for (var i = 0; i < res.data.apData.length; i++) {
          var aptotal = util.priceSwitch(res.data.apData[i].total);
          console.log(aptotal, '应付金额详情233');
        }
        that.setData({
          sumPayData: res.data.sumData[0],
          amt_end: util.priceSwitch(res.data.sumData[0].amt_end),
          apData: res.data.apData
        });
      } else {
        that.setData({
          sumPayData: { amt_end: '0.00' },
          amt_end: '0.00',
          apData: []
        });
      }
    })

  },
});
