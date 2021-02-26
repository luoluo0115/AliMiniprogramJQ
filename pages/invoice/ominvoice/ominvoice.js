var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    withReceiptsList: '',
    maxPageCount : 0,
    invoice_total_amt : 0,
    invoice_total_tax : 0,
    invoice_total_items : 0,
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //进项开票查询
    this.QueryWithReceipts();
  },

  /**
   * 进行认证查询
   */
  QueryWithReceipts: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-","");
    util.request(api.BillApi.PostWithReceipts, {
      cid: customer_info_id,
      curr_month: curr_month,
      pageSize:100,
      pageIndex:1
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        that.setData({
          withReceiptsList: res.data.list,
          maxPageCount : res.data.maxPageCount,
          invoice_total_amt : res.data.list2.invoice_total_amt,
          invoice_total_tax : res.data.list2.invoice_total_tax,
          invoice_total_items : res.data.list2.invoice_total_items,
        });
      } else {
        that.setData({
          withReceiptsList: '',
          maxPageCount : 0,
          invoice_total_amt : 0,
          invoice_total_tax : 0,
          invoice_total_items : 0,
        });
      }
    })

  },
  
});
