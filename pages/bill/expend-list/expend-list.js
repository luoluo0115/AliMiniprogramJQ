var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    curr_status: '', //当前做账状态
    msg: '',
    FileOssUrl: api.FileOssUrl,
    expendFileList: [],
    expense_name: '',
    expense_desc: '',
    upload_from: 'O',//文件上传来自界面 V:进行认证 O:其他
  },
  /**
    * 生命周期函数--监听页面加载
    */
  onLoad: function (options) {
    my.setBackgroundColor({
      backgroundColor: '#f5f5f5',
    })
    var data = JSON.parse(options.data);
    let upload_from = "O";
    if (options.upload_from) {
      upload_from = options.upload_from;
    }
    let expense_name = data.expense_name;
    let expense_desc = data.expense_desc;
    this.setData({
      expense_name: expense_name,
      expense_desc: expense_desc,
      upload_from: upload_from,
    })
    this.QueryExpendFile();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      curr_status: my.getStorageSync({ key: 'curr_status' }).data, //当前做账状态
    })
  },

  /**
   * 查询支出费用类别
   */
  QueryExpendFile: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    util.request(api.BillApi.QueryExpendFileDetail, {
      cid: customer_info_id,
      curr_month: curr_month,
      type: that.data.expense_name,
      pageIndex: 1,
      pageSize: 100
    }, 'POST').then(function (res) {
      if (res.data.list != null && res.data.list != '') {
        that.setData({
          expendFileList: res.data.list,
        });
      } else {
        that.setData({
          expendFileList: [],
          msg: '暂无数据'
        });
      }
    })

  },
  /**
   * 删除上传文件
   */
  deleteFile: function (event) {
    let that = this;
    let item = event.currentTarget.dataset.item;
    let process_recv_file_id = event.currentTarget.dataset.id;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    if (item.file_upload_from_ui == that.data.upload_from) {
      my.confirm({
        title: '提示',
        content: '确定删除吗？',
        success: function (sm) {
          if (sm.confirm) {
            util.request(api.BillApi.PostExpendFileDelete, {
              cid: customer_info_id,
              curr_month: curr_month,
              fileid: process_recv_file_id
            }, 'POST').then(function (res) {
              if (res.data == true) {
                util.Toast("删除成功", 'success');
                that.QueryExpendFile();

              } else {
                util.Toast(res.data.msg, 'fail');
              }
            })
          } else if (sm.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      util.Toast('进项认证上传的票据不能在此处删除');
    }
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
