const app = getApp()
var api = require('../../../config/api.js');
var util = require('../../../utils/util.js');
Page({
  data: {
    productList: [],
    activeKey: 0,
    productBigCatList: [],
    indexList: 0,
    menuHeight: "", //菜单高度
    currentTab: 0, //预设当前项的值
    scrollTop: 0, //tab标题的滚动条位置
    pre_product_id: '',
    serachvalue: '',
    activeTab: 0,
    tabs: [],
  },
  onLoad(options) {
    this.setData({
      pre_product_id: options.pre_product_id
    })
    this.QueryPreProductCategory()
  },
  handleChange(index) {
     this.setData({
      activeTab: index,
      page_index: 1,
      listData: [],
      product_big_cat: this.data.productBigCatList[index].product_category
    })
    this.QueryPreProductList();
  },
  onChange(index) {
     this.setData({
      activeTab: index,
      page_index: 1,
      listData: [],
      product_big_cat: this.data.productBigCatList[index].product_category
    })
    this.QueryPreProductList();
  },
  //搜索关键词
  onSearch(event) {
    console.log(event,'event')
    let that = this;
    that.setData({
      serachvalue: event
    })
    that.QueryPreProductList()
  },
  //获取前置产品分类
  QueryPreProductCategory: function () {
    let that = this
    util.request(api.QueryPreProductCategoryUrl, //获取前置产品列表
      {
        openid: app.globalData.openid
      }, 'POST').then(function (res) {
        console.log(res,'分类')
      if (res.data.success == true) {
        let productBigCatList = res.data.productBigCatList   
        var item = productBigCatList.map((ele, index) => {
          return {
            title: ele.product_category,
            anchor:ele.product_category
          }
        })
        that.setData({
          productBigCatList: res.data.productBigCatList,
          product_big_cat: res.data.productBigCatList[0].product_category,
           tabs: item,
        });
        that.QueryPreProductList()
      } else {
        that.setData({
          productBigCatList: [],
           tabs: []
        });
      }
    })
  },
  //获取前置产品列表
  QueryPreProductList: function () {
    let that = this;
    let postData = {
      openid: app.globalData.openid,
      pre_product_id: "0",
      product_Level: 2,
      parent_pre_product_id: that.data.pre_product_id,
      product_big_cat: that.data.product_big_cat,
      serachvalue: that.data.serachvalue
    }    
    console.log(postData,'postData')
    util.request(api.QueryPreProductListByLevelUrl, //获取前置产品列表
      postData, 'POST').then(function (res) {
      console.log(res, '获取前置产品列表')
      if (res.data.success == true) {
        that.setData({
          productList: res.data.productList,
        });
      } else {
        that.setData({
          productList: []
        });
      }
    })
  },
  onTapProductDetail: function (event) {
    let product_id = event.currentTarget.dataset.product_id
    wx.navigateTo({
      url: '../productDetail/productDetail?product_id=' + product_id
    })
  },
});
