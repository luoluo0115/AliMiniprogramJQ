var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    invoice_inventory: [],
     msg: ''
  },
  QueryImInvoiceStockInventory: function (e) {
    //开票信息
    let that = this;
    util.request(api.QueryImInvoiceStockInventoryUrl,
      {
        openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id
      }, 'POST').then(function (res) {
        console.log(JSON.stringify(res.data.ominvoicedata), '发票统计数据');
        if (res.data.success == true) {
          that.setData({
            invoice_inventory: res.data.invoice_inventory
          });
        }
        else {
          that.setData({
            invoice_inventory: [],
             msg: '暂无数据'
          });
        }
      })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //发票库存查询
    this.QueryImInvoiceStockInventory();
  },

});
