var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    account_year: '',
    LogList: [],
    showloading: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      account_year: util.formatYear(),
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.QueryDownloadLog()
  },
  /**
   * 日期选择起始
   */
  bindDateChange: function () {
    let that = this;
    my.datePicker({
      format: 'yyyy',
      currentDate: that.data.account_month,
      startDate: '2000-01',
      endDate: '2100-01',
      success: (res) => {
        that.setData({
          account_year: res.date
        });
      },
    });

  },
  /**
   * 查询数据
   */
  QueryDownloadLog: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let postData = {
      cid: customer_info_id,
      ui: app.globalData.user_id,
      type: 'F',
    }
    util.request(api.BillApi.QueryDownloadLogUrl, postData, 'POST').then(function (res) {
      console.log(res, 'res')
      if (res.data.success == true) {
        that.setData({
          LogList: res.data.logList,
        });
      } else {
        that.setData({
          LogList: []
        });
      }
    })

  },
  /**
   * 年度账册生成下载记录
   */
  btnPDF: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let user_name = app.globalData.user_name;
    let curr_customer_name = app.globalData.curr_customer_name
    let file_name = '年度账册_' + curr_customer_name + '_' + that.data.account_year + '';
    let postData = {
      cid: customer_info_id,
      user_id: app.globalData.user_id,
      user_name: user_name,
      file_category: 'F',
      file_name: file_name
    }
    console.log(postData, 'postData')
    util.request(api.BillApi.UploadPDFUrl, postData, 'POST').then(function (res) {
      console.log(res, 'res')
      if (res.data.success == true) {
        util.Toast(res.data.msg);
        that.QueryDownloadLog()
      } else {
        util.Toast(res.data.msg);
      }
    })

  },

  DownPDFYearAccountReport: function (event) {
    console.log(event, 'event')
    let download_log_id = event.target.dataset.account_data_download_log_id
    my.showLoading()
    let customer_info_id = app.globalData.curr_customer_info_id;
    if (customer_info_id > 0) {
      let postData = {
        year: this.data.account_year,
        cid: customer_info_id,
        cname: app.globalData.curr_customer_name,
        user_id: app.globalData.user_id,
        user_name: app.globalData.user_name,
        download_log_id: download_log_id
      }
      my.request({
        url: api.BillApi.DownPDFYearAccountReportUrl,
        data: postData,
        header: {
          "content-type": "application/json",
          'Authorization': 'Bearer ' + my.getStorageSync({ key: 'qh_access_token' }).data, //设置验证
        },
        method: "get",
        dataType: "json",
        responseType: "arraybuffer",
        success: (result) => {
          console.log("下载成功！", result);
          if (result.success == false) {
            my.showToast({
              title: result.msg,
              icon: 'none',
              duration: 2000,
            })
          } else {
            var fileManager = my.getFileSystemManager();
            var FilePath = my.env.USER_DATA_PATH + "/" + new Date().getTime() + ".pdf";
            fileManager.writeFile({
              data: result.data,
              filePath: FilePath,
              encoding: "binary", //编码方式 
              success: result => {
                my.openDocument({ //成功之后直接打开
                  filePath: FilePath,
                  showMenu: true,
                  fileType: "pdf",
                  success: result => {
                    console.log("打开文档成功");
                  },
                  fail: err => {
                    console.log("打开文档失败", err);
                  }
                });
                my.hideLoading();
              },
              fail: res => {
                my.showToast({
                  title: '下载失败!',
                  icon: 'none',
                  duration: 2000,
                })
                console.log(res);
              }
            })
            my.hideLoading()
          }
        },
        fail(err) {
          console.log(err)
          my.hideLoading()
        }

      })
    } else {
      my.showToast({
        title: '请选择客户后下载报表!',
        icon: 'none',
        duration: 2000,
      })
    }
  },

  DownPDF: function (e) {
    var item = e.currentTarget.dataset.item;
    my.downloadFile({
      url: api.FileOssUrl + item.file_name_guid,
      success: function (res) {
        console.log(res, 'previewPDF')
        const filePath = res.apFilePath;
        my.openDocument({
          filePath: filePath,
          fileType: 'pdf',
          success: function (res) {             
          }
        })
      }
    });
  },
});
