var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    curr_status: '',
    showModal: false,
    invoiceFileList: [],
    msg: '',
    FileOssUrl: api.FileOssUrl,
    src: "",
    is_up: false,
    filePath: '', //文件路径
    fileName: '', //文件名称

    zInvoiceQty: 0,
    zInvoiceAmount: 0,
    zInvoiceTax: 0,
    pInvoiceQty: 0,
    pInvoiceAmount: 0,
    pInvoiceTax: 0,
    InvoiceQty: 0,
    InvoiceAmount: 0,
    InvoiceTax: 0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     my.setBackgroundColor({
        backgroundColor: '#f5f5f5',
    })
    this.setData({
      curr_status: my.getStorageSync({ key: 'curr_status' }).data,
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.QueryInvoiceFile();
    this.QueryInvoiceCount();
  },
  //弹窗
  addUpload: function () {
    this.setData({
      showModal: true
    })
  },

  // 禁止屏幕滚动
  preventTouchMove: function () {
  },

  // 弹出层里面的弹窗
  close: function () {
    this.setData({
      showModal: false
    })
  },
  QueryInvoiceCount: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    util.request(api.BillApi.QueryInvoiceCount, {
      cid: customer_info_id,
      curr_month: curr_month,
    }, 'POST').then(function (res) {
      console.log(res);
      if (res.data.success == true) {
        that.setData({
          zInvoiceQty: res.data.data.dt2[0].zys,
          zInvoiceAmount: res.data.data.dt2[0].zym,
          zInvoiceTax: res.data.data.dt2[0].zye,
          pInvoiceQty: res.data.data.dt3[0].zys,
          pInvoiceAmount: res.data.data.dt3[0].zym,
          pInvoiceTax: res.data.data.dt3[0].zye,
          InvoiceQty: res.data.data.dt[0].zys,
          InvoiceAmount: res.data.data.dt[0].zym,
          InvoiceTax: res.data.data.dt[0].zye,
        });
      } else {
        that.setData({
          zInvoiceQty: 0,
          zInvoiceAmount: 0,
          zInvoiceTax: 0,
          pInvoiceQty: 0,
          pInvoiceAmount: 0,
          pInvoiceTax: 0,
          InvoiceQty: 0,
          InvoiceAmount: 0,
          InvoiceTax: 0,
        });
      }
    })
  },
  QueryInvoiceFile: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    util.request(api.BillApi.QueryInvoiceDetail, {
      cid: customer_info_id,
      curr_month: curr_month,
      pageIndex: 1,
      pageSize: 100
    }, 'POST').then(function (res) {
      if (res.data.list != null && res.data.list != '') {
        that.setData({
          invoiceFileList: res.data.list,
        });
      } else {
        that.setData({
          invoiceFileList: [],
          msg: '暂无数据'
        });
      }
    })

  },

  chooseImg() {
    let that = this;
    my.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const filePath = res.apFilePaths[0];
        my.getFileInfo({
          apFilePath: filePath,
          digestAlgorithm: 'sha1',
          success: (res) => {
            var size = res.size;
            //限制了文件大小
            if (size > 4194304) {
              my.showToast({
                content: '文件大小不能超过4MB！',
                type: "none",
                duration: 2000
              })
            } else {
              that.setData({
                src: filePath,
                is_up: true
              })
              that.uploadImg();
            }
          }
        })
      }
    })
  },
  uploadImg: function () {
    let that = this;
    if (that.data.src == '') {
      util.Toast('请选择发票上传');
      return;
    }

    let customer_info_id = app.globalData.curr_customer_info_id;
    let customer_name = app.globalData.curr_customer_name;
    let account_month = app.globalData.curr_date.replace("-", "");
    let type = 0;
    let payCategory = '公司转账';
    let fytype = '';
    let payid = '';
    let payname = '';
    let invoice = "I";
    let paytype = "收入";
    let url = api.BillApi.PostInvoiceUpload + "?cid=" + customer_info_id + "&cname=" + encodeURI(customer_name) + "&invoice=" + invoice + "&type=0&payCategory=" + encodeURI(payCategory) + "&fytype=" + fytype + "&payid=" + payid + "&payname=" + encodeURI(payname) + "&paytype=" + encodeURI(paytype) + "&account_month=" + account_month;    
    my.showLoading({      
      delay: 1000,
      content: '发票识别中...'
    });
    my.uploadFile({
      url: url,
      filePath: that.data.src,      
      fileType: 'image',
      fileName: 'file',
      header: {
        "Content-Type": "multipart/form-data", //记得设置
        'Authorization': 'Bearer ' +  my.getStorageSync({ key: 'qh_access_token' }).data
      },
      formData: {
        'cid': customer_info_id,
        'cname': customer_name,
        'account_month': account_month,
        'type': type,
        'payCategory': payCategory,
        'fytype': fytype,
        'payid': payid,
        'payname': payname,
        'invoice': invoice,
        'paytype': paytype,
      },
      success: function (res) {
        console.log(res);
        my.hideLoading();
        var result = JSON.parse(res.data);        
        if (result.success == true) {
          that.setData({
            showModal: false,
            src: ''
          })
          util.Toast(result.msg,'success');
          that.QueryInvoiceFile();
          that.QueryInvoiceCount();
        } else if (result.success == false) {
          util.Toast(result.msg,'fail');
        }

      },
      fail: function (res) {
        console.log(res);
      },
    })
  },

  chooseFile() {
    let that = this;
    my.chooseMessageFile({
      count: 1, //选择文件的数量
      type: 'file', //选择文件的类型,这里只允许上传文件.还有视频,图片,或者都可以
      success(res) {
        var size = res.tempFiles[0].size;
        var filename = res.tempFiles[0].name;
        var newfilename = filename + "";
        console.log(newfilename)
        //限制了文件大小和具体文件类型
        if (size > 4194304 || (newfilename.indexOf(".PDF") == -1 && newfilename.indexOf(".pdf") == -1)) {
          my.showToast({
            title: '文件大小不能超过4MB,格式必须为[PDF]！',
            icon: "none",
            duration: 2000,
            mask: true
          })
        } else {
          that.setData({
            filePath: res.tempFiles[0].path, //文件的路径
            fileName: filename, //文件名称
          })
          that.uploadFile();
        }
      }
    })
  },
  uploadFile: function () {
    let that = this;
    if (that.data.filePath == '') {
      util.Toast('请选择发票文件上传');
      return;
    }
    let customer_info_id = app.globalData.curr_customer_info_id;
    let customer_name = app.globalData.curr_customer_name;
    let account_month = app.globalData.curr_date.replace("-", "");
    let type = 0;
    let payCategory = '公司转账';
    let fytype = '';
    let payid = '';
    let payname = '';
    let invoice = "I";
    let paytype = "收入";
    let url = api.BillApi.PostInvoiceUpload + "?cid=" + customer_info_id + "&cname=" + customer_name + "&invoice=" + invoice + "&type=0&payCategory=" + payCategory + "&fytype=" + fytype + "&payid=" + payid + "&payname=" + payname + "&paytype=" + paytype + "&account_month=" + account_month;
    
    my.showLoading({      
      delay: 1000,
      content: '发票文件上传中...'
    });     
    my.uploadFile({
      url: url,
      filePath: that.data.filePath,
      name: 'file',
      header: {
        "Content-Type": "multipart/form-data", //记得设置
        'Authorization': 'Bearer ' + my.getStorageSync({ key: 'qh_access_token' }).data
      },
      formData: {
        'cid': customer_info_id,
        'cname': customer_name,
        'account_month': account_month,
        'type': type,
        'payCategory': payCategory,
        'fytype': fytype,
        'payid': payid,
        'payname': payname,
        'invoice': invoice,
        'paytype': paytype,
      },
      success: function (res) {
        my.hideLoading();
        var result = JSON.parse(res.data);
        if (result.success == true) {
          that.setData({
            showModal: false,
            filePath: ''
          })
          util.Toast(result.msg,'success');
          that.QueryInvoiceFile();
          that.QueryInvoiceCount();
        } else if (result.success == false) {
          util.Toast(result.msg,'fail');
        }
      },
      fail: function (res) {
        console.log(res);
      },
    })
  },

  chooseFileWeb: function () {
    let that = this;
    let bank_account_number= that.data.bank_account_number;
    let file_month = that.data.file_month;
    my.navigateTo({
      url: "/pages/home/commWebView/commWebView?Utype=2",
    });
  },

  /**
   * 删除上传文件
   */
  deleteFile: function (event) {
    let that = this;
    let process_recv_file_id = event.currentTarget.dataset.id;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    my.confirm({
      title: '提示',
      content: '确定删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          util.request(api.BillApi.PostInvoiceDelete, {
            cid: customer_info_id,
            curr_month: curr_month,
            fileid: process_recv_file_id
          }, 'POST').then(function (res) {
            if (res.data == true) {
              util.Toast("删除成功", 'success');
              that.QueryInvoiceFile();
              that.QueryInvoiceCount();
            } else {
              util.Toast(res.data.msg, 'fail');
            }
          })
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
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
  }
});
