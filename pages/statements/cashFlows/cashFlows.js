var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    cashdata: [],
    categorydata: []
  },
  /**
    * 生命周期函数--监听页面显示
    */
  onShow: function () {
    this.QueryCashFlowsStatement();
  },
  /**
   * 现金流量表查询
   */
  QueryCashFlowsStatement: function (e) {
    let that = this;
    util.request(api.QueryCashFlowsStatementUrl, {
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {

      if (res.data.success == true) {
        console.log(res.data.cashdata, '现金流量表')
        that.setData({
          cashdata: res.data.cashdata,
          categorydata: res.data.categorydata
        });
      } else {
        that.setData({
          cashdata: [],
          categorydata: []
        });
      }
    })
  },

});
