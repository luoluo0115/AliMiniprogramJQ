var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
     MonthlyAmortizationData:[],
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      this.QueryEmMonthlyAmortization();
  },

  QueryEmMonthlyAmortization:function() {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-","");
    util.request(api.BillApi.QueryEmMonthlyAmortization,
      {cid:customer_info_id,curr_month:curr_month}
      ,'POST').then(function(res){
        if(res.data.success==true){
          that.setData({
            MonthlyAmortizationData:res.data.monthlyAmortization
          });
        }else{
          that.setData({
            MonthlyAmortizationData:[]
          });
        }
      })
  },
   
});
