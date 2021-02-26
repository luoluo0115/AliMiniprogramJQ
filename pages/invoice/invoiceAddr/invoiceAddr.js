var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    ExpressList: [],
    im_cust_customer_id: 0,//销售方客户ID
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let im_cust_customer_id = options.im_cust_customer_id;
    if (options.im_cust_customer_id) {
      that.setData({
        im_cust_customer_id: options.im_cust_customer_id,
      });
    }    
  },
  onShow: function () {
    this.QueryCustExpress();
  },
  goAdd: function (event) {
    let type = event.currentTarget.dataset.type;
    let im_cust_customer_id = this.data.im_cust_customer_id;
    my.navigateTo({
      url: "/pages/invoice/invoiceAddrAdd/invoiceAddrAdd?im_cust_customer_id=" + im_cust_customer_id + "&type=" + type
    })
  },
  goEdit: function (event) {
    let type = event.currentTarget.dataset.type;
    let data = event.currentTarget.dataset.item;
    let im_cust_customer_id = this.data.im_cust_customer_id;
    my.navigateTo({
      url: "/pages/invoice/invoiceAddrAdd/invoiceAddrAdd?im_cust_customer_id=" + im_cust_customer_id + "&type=" + type + "&item=" + JSON.stringify(data)
    })
  },
  /**
   * 删除地址
   */
  deleteExp: function (e) {
    var self = this;
    var item = e.currentTarget.dataset.item;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    let user_id = app.globalData.user_id;
    my.confirm({
      title: '提示',
      content: '确认删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          var deleteData = {
            im_cust_express_id: item.im_cust_express_id
          };
          console.log(deleteData)
          util.request(api.BillApi.DelExpress, deleteData, 'POST').then(function (res) {
            if (res.data.success == true) {
              self.QueryCustExpress();
              util.Toast("删除成功", 'success');
            } else {
              util.Toast(res.data.msg, 'fail');
            }
          })
        } else if (sm.cancel) {
        }
      }
    })
  },
  expressChange: function (event) {
    let data = event.currentTarget.dataset.item;
    console.log(data)
    let pages = getCurrentPages();//获取所有页面
    let currentPage = null;   //当前页面
    let prevPage = null;  //上一个页面
    if (pages.length >= 2) {
      currentPage = pages[pages.length - 1]; //获取当前页面，将其赋值
      prevPage = pages[pages.length - 2]; //获取上一个页面，将其赋值
    }
    if (prevPage) {
      let formData = prevPage.data.formData;
      prevPage.setData({
        ['formData.im_cust_express_id']: data.im_cust_express_id,
        ['formData.express_address']: data.express_address,
        ['formData.express_contact_name']: data.express_contact_name,
        ['formData.express_contact_phone']: data.express_contact_phone,
        ['formData.province']: data.province,
        ['formData.city']: data.city,
        ['formData.district']: data.district,
      })
    }
    my.navigateBack({
      delta: 1,
    })
  },
  /**
   * 查询快递地址
   */
  QueryCustExpress: function () {
    let that = this;
    let im_cust_customer_id = that.data.im_cust_customer_id;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    util.request(api.BillApi.QueryCustExpress, {
      customer_info_id: customer_info_id,
      curr_month: curr_month,
      im_cust_customer_id: im_cust_customer_id
    }, 'POST').then(function (res) {
      console.log(res);
      if (res.data.success == true) {
        that.setData({
          ExpressList: res.data.listExpress,
        });
      } else {
        that.setData({
          ExpressList: []
        });
      }
    })
  },

});
