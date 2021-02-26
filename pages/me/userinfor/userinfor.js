var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    customer_info_id: app.globalData.customer_info_id,
    customer_name: [],
    register_addr: [],
    actual_addr: [],
    tax_type: [],
    tax_levy_method: [],
    tax_code: [],
    legal_person: [],
    customer_in_charge_ext: [],
    customer_in_charge_name: [],
    enterprise_type: [],
    custContactList:[],//授权列表
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    util.request(api.QueryCustomerListUrl,
      { openid:app.globalData.openid,customer_info_id:app.globalData.curr_customer_info_id,}
      ,'POST').then(function(res){
        if(res.data.success==true){
          var customerList=JSON.stringify(res.data.customerList);
          that.setData({
            customerList:res.data.customerList[0]
          });
          console.log(JSON.stringify(res.data.customerList)+"我的公司信息");
        }else{
          that.setData({
            customerList:[]
            
          });
        }
      })
    
    that.QueryCustContact();
  },

  QueryCustContact:function(){
    let that = this;
    util.request(api.QueryCustomerContactList,
      { openid:app.globalData.openid,customer_info_id:app.globalData.curr_customer_info_id,user_id:app.globalData.user_id,user_name:app.globalData.user_name}
      ,'POST').then(function(res){
        console.log(res)
        if(res.data.success==true){
          that.setData({
            custContactList:res.data.info
          });
        }else{
          that.setData({
            custContactList:[]
          });
        }
      })
  },
  /**
   * 取消授权
   */
  CancelAuth: function (e) {
    var self = this;
    var item = e.currentTarget.dataset.item;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-","");
    let user_id = app.globalData.user_id;
    let user_name = app.globalData.user_name;
    my.showModal({
      title: '提示',
      content: '确认取消该用户授权吗？',
      success: function (sm) {
        if (sm.confirm) {
          var Data = {
            customer_info_id: customer_info_id,
            user_name: user_name,
          };          
          util.request(api.PostCancelAuthorization, Data, 'POST').then(function (res) {
            if (res.data.success == true) {
              self.QueryCustContact();
              util.Toast("取消授权成功",'success');
            } else {
              util.Toast(res.data.msg,'fail');
            }
          })
        } else if (sm.cancel) {
        }
      }
    })
  },
  
});
