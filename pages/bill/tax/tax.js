var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    PostWithTaxList: [],
    activeNames: ['0'],
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.PostWithTaxFile();
  },

  onChangelist(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
  /**
   * 进行认证查询
   */
  PostWithTaxFile: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.split('-').join("");;
    util.request(api.BillApi.PostWithTaxFile, {
      cid: customer_info_id,
      curr_month: curr_month,
      pageSize: 100,
      pageIndex: 1
    }, 'POST').then(function (res) {
      console.log(res, 'res')
      if (res.data.success == true) {
        that.setData({
          PostWithTaxlist: res.data.list,
        });
        console.log(that.data.PostWithTaxlist, 'PostWithTaxlist')

      } else {
        that.setData({
          PostWithTaxList: []
        });
      }
      console.log(that.data.PostWithTaxlist, 'PostWithTaxlist111')
    })

  },

  previewPDF: function (e) {
    var item = e.currentTarget.dataset.item;
    my.downloadFile({
      url: api.FileOssUrl + item.file_name_guid,
      success: function (res) {
        console.log(res,'previewPDF')
        const filePath = res.tempFilePath;
        my.openDocument({
          filePath: filePath,
          success: function (res) {

          }
        })
      }
    });
  },
  /**
   * 预览图片
   */
  previewImage: function (event) {
    var src = event.currentTarget.dataset.src; //获取data-src
    var imgList = event.currentTarget.dataset.list; //获取data-list
    //图片预览
    my.previewImage({
      current: src, // 当前显示图片的http链接
      urls: [imgList] // 需要预览的图片http链接列表
    })
  },
 
});
