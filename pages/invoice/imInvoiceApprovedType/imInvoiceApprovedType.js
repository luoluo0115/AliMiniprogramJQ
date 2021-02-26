var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
     invoice_tax_type: [],
      msg: ''
  },
   /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      my.setBackgroundColor({
        backgroundColor: '#f5f5f5',
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //进项开票查询
    this.QueryImInvoiceApprovedType();
  },
  QueryImInvoiceApprovedType: function(e){
    //开票信息
    let that = this;
    util.request(api.QueryImInvoiceApprovedTypeUrl,
      { openid:app.globalData.openid,customer_info_id:app.globalData.curr_customer_info_id
    },'POST').then(function(res){
      if(res.data.success== true ){
        that.setData({
          invoice_tax_type: res.data.invoice_tax_type
        });
      }
      else{
        that.setData({
          invoice_tax_type: [],
           msg: '暂无数据'
        });
      }
      })
    
  },

});
