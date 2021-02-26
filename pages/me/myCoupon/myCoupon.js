var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    tabs2: [{title: '待使用'},{title: '已使用'},{title: '已过期'},{title: '待绑定'} ],
    activeTab2: 0,
    myCouponList: [],
    status: "N",
    active: 0,
    curr_customer_name: '',
    customerList:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let curr_customer_name = app.globalData.curr_customer_name;
    that.setData({
      curr_customer_name: curr_customer_name,
      customerList:JSON.parse(options.customerList)
    })    
    that.QueryMyCoupon(that.data.status)
  },
  //切换我的优惠券title
  handleTabClick({ index, tabsName }) {
    let that = this;
    that.setData({
      [tabsName]: index,
    });
    let title = that.data.tabs2[index].title;    
    if (title == '待使用') {
      this.QueryMyCoupon('N')
    } else if (title == '已使用') {
      this.QueryMyCoupon('Y')
    } else if (title == '已过期') {
      this.QueryMyCoupon('X')
    } else if (title == '待绑定') {
      this.QueryMyCoupon('W')
    }
  },
  handleTabChange({ index, tabsName }) {
    let that = this;
    that.setData({
      [tabsName]: index,
    });     
     let title = that.data.tabs2[index].title;    
    if (title == '待使用') {
      this.QueryMyCoupon('N')
    } else if (title == '已使用') {
      this.QueryMyCoupon('Y')
    } else if (title == '已过期') {
      this.QueryMyCoupon('X')
    } else if (title == '待绑定') {
      this.QueryMyCoupon('W')
    }
  },
  //我的优惠券
  QueryMyCoupon: function (e) {
    let that = this;
    util.request(api.QueryMyCouponUrl, //查询我的订单
      {
        openid: app.globalData.openid,
        user_id: app.globalData.user_id,
        status: e,
        customer_info_id: app.globalData.curr_customer_info_id
      }, 'POST').then(function (res) {      
      if (res.data.success == true) {
        that.setData({
          myCouponList: res.data.myCouponList,
        });
        console.log(res.data.myCouponList, 'res.data.myCouponList,')
      } else {
        that.setData({
          myCouponList: [],
          msg: res.data.msg
        });

      }
    })

  },     
  goProduct: function (e) {
    let item_id = e.currentTarget.dataset.item_id
    let coupon_category = e.currentTarget.dataset.coupon_category
    if (item_id == "999998") {
      my.redirectTo({
        url: '/pages/invoice/invoiceInfo/invoiceInfo'
      })
    } else if ((item_id == "999998")) {
      my.switchTab({
        url: '/pages/bill/index/index'
      })
    } else {
      my.switchTab({
        url: '/pages/product/index/index'
      })
    }


  },

  BindCoupon: function (e) {
    var self = this;
    let item = e.currentTarget.dataset.item
    let promotion_coupon_user_id = item.promotion_coupon_user_id;
    var promotion_coupon_id = item.promotion_coupon_id;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_customer_name = app.globalData.curr_customer_name;
    let curr_month = app.globalData.curr_date.replace("-", "");
    let user_id = app.globalData.user_id;
    let openid = app.globalData.openid;
    my.confirm({
      title: '提示',
      content: '确定绑定该优惠券到('+curr_customer_name+')吗？',
      success: function (sm) {
        if (sm.confirm) {           
          util.request(api.PostBindCouponUrl, {
            openid: openid,
            promotion_coupon_user_id: promotion_coupon_user_id,
            promotion_coupon_id: promotion_coupon_id,
            customer_info_id: customer_info_id,
            curr_month: curr_month,
            user_id: user_id,
          }, 'POST').then(function (res) {
            console.log(res);
            if (res.data.success == true) {
              self.QueryMyCoupon('W');
              util.Toast.success(res.data.msg);
            } else {
              util.Toast.fail(res.data.msg);
            }
          })
        } else if (sm.cancel) {
        }
      }
    })
  },

});
