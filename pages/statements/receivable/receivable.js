var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    date:'',
    sumReceivableData: {amt_end:0},
    arData:[]
  },
   /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      date:  app.globalData.curr_date,
    });
    this.QueryAccountReceivable();
  },
  //应收账款
   QueryAccountReceivable: function(e){
    let that = this;
    util.request(api.QueryAccountReceivableUrl,{
      openid:app.globalData.openid,customer_info_id:app.globalData.curr_customer_info_id,
      account_month:app.globalData.curr_date.split('-').join("")
    },'POST').then(function(res){
      console.log(res,'成功');
      if(res.data.success==true){
        that.setData({
          sumReceivableData: res.data.sumData[0],
          arData: res.data.arData
        });
      }else{
        that.setData({
          sumReceivableData: {amt_end:0},
          arData:[]
        });
      }
    })
  }
});
