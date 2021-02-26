var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    bankList:[],
    list:[],
    bankImage:[
      {img:api.ImgUrl+"B001"},
      {img:api.ImgUrl+"B002"},
      {img:api.ImgUrl+"B003"},
      {img:api.ImgUrl+"B004"},
      {img:api.ImgUrl+"B005"},
      {img:api.ImgUrl+"B006"},
      {img:api.ImgUrl+"B007"},
      {img:api.ImgUrl+"B008"},
      {img:api.ImgUrl+"B009"},
      {img:api.ImgUrl+"B010"},
      {img:api.ImgUrl+"B011"},
      {img:api.ImgUrl+"B012"},
    ],
    ImgUrl:api.ImgUrl,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     my.setBackgroundColor({
        backgroundColor: '#f5f5f5',
    })
      this.QueryBankInfo();
  },
  /**
   * 查询支出费用类别
   */
  QueryBankInfo: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-","");
    util.request(api.BillApi.QueryBankInfo, {
      cid: customer_info_id,
      curr_month: curr_month
    }, 'POST').then(function (res) {
      console.log(res);
      if (res.data.success == true) {
        that.setData({
          bankList: res.data.data,
          list:res.data.list
        });
      } else {
        that.setData({
          bankList: [],
          list:[]
        });
      }
    })
  },
  /**
   * 上传银行票据
   */
  gotoBankDetail: function (e) {
    var data = e.currentTarget.dataset.item;
    my.navigateTo({
      url: '/pages/bill/bank-detail/bank-detail?data='+encodeURIComponent(JSON.stringify(data)),
    })
  },
  bindIntro: function (e) {
    var data = e.currentTarget.dataset.item;
    let bank_name = data.bank_name;
      var src = this.data.ImgUrl + bank_name;
      var imgList = this.data.ImgUrl + bank_name;      
      //图片预览
      my.previewImage({
        current: src, // 当前显示图片的http链接
        urls: [imgList] // 需要预览的图片http链接列表
      })
  },
  
});
