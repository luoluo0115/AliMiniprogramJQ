var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    userInfo: [],
    date: [],
    index: '',
    companyName: [],
    show: false,
    customer_in_charge_number: '',
    customer_in_charge_ext: '',
    customerList: [],
    companyList: app.globalData.customer_info_id_list,
    customer_info_id: '',
    messageCount: 0, //消息个数
    itemsThumb: [
      {
        iconname: 'iconRectangleCopy6',
        title: '公司信息',
        url: "/pages/me/userinfor/userinfor"
      },
      {
        iconname: 'iconRectangleCopy6',
        title: '个人信息',
        url: "/pages/me/userinfo/userinfo"
      },
      {
        iconname: 'iconRectangleCopy4',
        title: '认证授权',
        url: "/pages/me/authorization/authorization"
      },
      {
        iconname: 'iconRectangleCopy2',
        title: '我的订单',
        url: "/pages/me/myOrder/myOrder"
      },
      {
        iconname: 'iconRectangleCopy3',
        title: '充值消费',
        url: "/pages/me/wallet/wallet"
      },
      // {
      //   iconname:'iconRectangleCopy',
      //   title:'发票申请',
      //  url:"/pages/me/customerInvoiceInfo/customerInvoiceInfo"
      // },
      {
        iconname: 'iconRectangleCopy',
        title: '我的礼券',
        url: "/pages/me//myCoupon/myCoupon"
      },
      {
        iconname: 'iconRectangleCopy5',
        title: '合同查看',
        url: "/pages/me/contract/contract"
      },
      {
        iconname:'iconRectangleCopy',
        title:'年度公示',
       url:"/pages/me/onlinepublic/onlinepublic"
      },
      {
        iconname: 'iconxiaoxi1',
        title: '消息中心',
        url: "/pages/me/message/message"
      },
      {
        iconname: 'iconkefu1',
        title: '专属客服',
        url: "/pages/me/customerService/customerService"
      }

    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userInfo: my.getStorageSync({ key: 'userInfo' }).data
    })
    //时间与公司名列表
    var list = [];
    if (app.globalData.customer_info_id_list != '') {
      this.QueryCustomerList();
    } else {
      util.Toast('暂无客户信息');
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {    
    if (this.data.index != app.globalData.index || app.globalData.refresh) {      
      this.setData({
        index: app.globalData.index,
      });
      var list = [];
      console.log(app.globalData.customer_info_id_list,'app.globalData.customer_info_id_list')
      if (app.globalData.customer_info_id_list != '') {
        this.QueryCustomerList();
      } else {
        util.Toast('暂无客户信息');
      }
    }
    //消息个数
    this.QueryMessageCount();
  },
  /**
   * 获取消息个数
   */
  QueryMessageCount: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let user_id = app.globalData.user_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    util.request(api.QueryMessageCount, {
      cid: customer_info_id,
      curr_month: curr_month,
      ui: user_id,
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        that.setData({
          messageCount: res.data.total,
        });
      } else {
        that.setData({
          messageCount: 0,
        });
      }
    })

  },
  QueryCustomerList: function () {
    let that = this;    
    util.request(api.QueryCustomerListUrl, {
      openid: app.globalData.openid,
      customer_info_id: app.globalData.curr_customer_info_id,
    }, 'POST').then(function (res) {            
      if (res.data.success == true) {
        that.setData({
          customerList: res.data.customerList[0]
        });
        var customer_in_charge_ext = res.data.customerList[0].customer_in_charge_ext;
        app.globalData.customer_in_charge_ext = customer_in_charge_ext;
        var customer_in_charge_number = customer_in_charge_ext.substring(customer_in_charge_ext.length - 1);
        app.globalData.customer_in_charge_number = customer_in_charge_number;        
      } else {
        that.setData({
          customerList: [],
          customer_in_charge_ext: [],
          customer_in_charge_number: []
        });
      }
    })


  },
  showCustomDialog: function () {
    this.setData({
      show: true
    });
  },  

  /*跳转我的优惠券*/
  bindTapmyCoupon: function () {
    my.navigateTo({
      url: '../myCoupon/myCoupon?customerList=' + JSON.stringify(this.data.customerList)
    })
  },
  /*跳转子页面*/
  onUrlGo: function (event) {
    let url = event.target.dataset.url;
    let title = event.target.dataset.title;
    if (title == '我的礼券') {
      my.navigateTo({
        url: '../myCoupon/myCoupon?customerList=' + JSON.stringify(this.data.customerList)
      })
    } else {
      my.navigateTo({
        url: url
      })
    }   
  },
  
});