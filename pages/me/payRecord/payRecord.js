var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    custAccountTrans:'',
    NoData:'',
  },
    /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.QueryCustAccountTrans()
  },
  /**
   * 交易记录
   */
  QueryCustAccountTrans:function() {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-","");
    let postData={
      openid:app.globalData.openid,cid:customer_info_id,ui: app.globalData.user_id
    }
    util.request(api.QueryCustAccountTrans,
      postData
      ,'POST').then(function(res){
        if(res.data.success==true){
          that.setData({
            custAccountTrans:res.data.custAccountTrans,
            NoData:'',
          });
        }else{
          that.setData({
            custAccountTrans:'',
            NoData:'暂无数据',
          });
        }
    }) 
  },


});
