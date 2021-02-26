var app = getApp();
var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
Page({
  data: {
    indicatorDots: true,
    autoplay: false,
    vertical: false,
    interval: 2000,
    circular: true,
    curr_date: '',
    bannerList: [],
    productList: [],
    curr_customer_info_id: '',
    customer_info_id: '',
  },
  goBanner(e) {
    let item = e.currentTarget.dataset.item;
    let jump_url = item.jump_url
    if (jump_url) {
      my.navigateTo({
        url: jump_url
      })
    }
  },
  //获取轮播图
  QuerySpreadFocusList: function () {
    let that = this;
    util.request(api.QuerySpreadFocusUrl, {
      openid: app.globalData.openid,
      cid: "0"
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        that.setData({
          bannerList: res.data.spreadImg,
        });

      } else {
        that.setData({
          bannerList: []
        });
      }
    })


  },
  //获取前置产品列表
  QueryPreProductList: function () {
    let that = this;
    util.request(api.QueryPreProductListUrl, //获取前置产品列表
      {
        openid: app.globalData.openid,
        pre_product_id: "0"
      }, 'POST').then(function (res) {
        if (res.data.success == true) {
          that.setData({
            productList: res.data.productList,
          });
          //console.log(res.data.productList, 'res.data.productList')

        } else {
          that.setData({
            productList: []
          });
        }
      })


  },
  onLoad(query) {    
    var that = this;
    app.globalData.curr_date = util.LastMonth(new Date());
    let index = app.globalData.index;
    if (app.globalData.customer_info_id_list != '') {
      app.globalData.curr_customer_info_id = app.globalData.customer_info_id_list[index].customer_info_id;
      app.globalData.curr_customer_name = app.globalData.customer_info_id_list[index].customer_name;
    } else {
      app.globalData.curr_customer_info_id = 0;
      app.globalData.curr_customer_name = '';
    }
    that.QuerySpreadFocusList();
    that.QueryPreProductList();
  },
  onShow() {
    this.setData({
      autoplay: true
    });
  },
  onTapProductDetail(event) {
    
    let pre_product_id = event.currentTarget.dataset.pre_product_id
    my.navigateTo({ url: '/pages/product/productDetail/productDetail?pre_product_id=' + pre_product_id })
  },
  onTapProductList: function (event) {
    let product_id = event.currentTarget.dataset.pre_product_id;
    my.navigateTo({
      url: '../productList/productList?pre_product_id=' + product_id
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.QuerySpreadFocusList();
    this.QueryPreProductList();
    my.stopPullDownRefresh();
  },  
  onShareAppMessage: function () {
    let user_id = app.globalData.user_id
    let referral_code = my.getStorageSync({key:'referral_code'}).data;
    return {
      title: '巧记账',
      desc: '巧记账',
      path: '/pages/index/index?referral_code=' + referral_code + '&user_id=' + user_id,
    }
  },
 
});
