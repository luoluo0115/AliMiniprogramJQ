var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    processRuncard: {process_recv_info_id: 0, recv_status: ""},
    account_month : '',
    customer_info_name:''
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      account_month : app.globalData.curr_date,
      curr_status: my.getStorageSync({ key: 'curr_status' }).data,//当前做账状态
      customer_info_name:app.globalData.curr_customer_name
    });
    this.QuerySalary();
  },
  /**
   * 查询薪资数据
   */
  QuerySalary: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-","");
    util.request(api.BillApi.QueryMonthlySalary, {
      cid: customer_info_id,
      salary_month: curr_month
    }, 'POST').then(function (res) {
      console.log(res,'工资')
      that.setData({
        processRuncard : {
          process_recv_info_id: 0, recv_status: ""
        }
      });
      if (res.data.success == true) {
        that.setData({
          salaryList: res.data.salaryData,
          processRuncard: res.data.processRuncard[0]
        });
      } else {
        that.setData({
          salaryList: []
        });
      }
    })

  },

});
