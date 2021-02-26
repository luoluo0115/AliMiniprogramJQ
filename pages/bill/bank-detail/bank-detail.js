var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    tabs2: [{ title: '银行回单' }, { title: '银行对帐单' }],
    activeTab2: 0,
    curr_status: '',//当前做账状态
    FileOssUrl: api.FileOssUrl,
    activeNames: [],
    bank_id: 0,
    bank_name: '',//银行名称
    bank_account_number: '',//银行账号
    filePath: '', //文件路径
    fileName: '', //文件名称
    imgPath: '', //图片路径
    imgName: '', //图片名称
    BankReceiptList: [],//银行回单
    BankStatementList: [],//银行流水
    pageSize: 100,
    pageIndex: 1,
    msg: '',
    LSmsg: '',
    active: 0,
    file_month: '',
    dr: 0,//出账总额
    cr: 0,//入账总额
    qty: 0,//数量
    showloading: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     my.setBackgroundColor({
        backgroundColor: '#f5f5f5',
    })
    console.log(options)
    var data = JSON.parse(options.data)
    let bank_name = data.bank_name;
    this.setData({
      bank_id: data.am_bank_id,
      bank_name: bank_name,
      bank_account_number: data.bank_account_number
    })

    my.setNavigationBar({
      title: this.data.bank_name
    });    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      curr_status: my.getStorageSync({ key: 'curr_status' }).data, //当前做账状态    
      file_month: app.globalData.curr_date,  
    });
    this.getData();  
  },
  getData: function () {
    Promise.all([this.QueryBankReceipt(), this.QueryBankStatement(), this.QueryBankSumAmount(1)]).then(res => {
      my.stopPullDownRefresh()
    });
  },
  handleTabClick({ index, tabsName }) {
    console.log(index)
    this.setData({
      [tabsName]: index,
    });
    let title = this.data.tabs2[index].title    
    if (title == '银行回单') {
      this.QueryBankReceipt();
      this.QueryBankSumAmount(1);
    } else if (title == '银行对账单') {
      this.QueryBankStatement();
      this.QueryBankSumAmount(2);
      this.setData({
        file_month: app.globalData.curr_date,
      });
    }
  },
  handleTabChange({ index, tabsName }) {
    this.setData({
      [tabsName]: index,
    });
    let title = this.data.tabs2[index].title
    console.log(title, 'title')
    if (title == '银行回单') {
      this.QueryBankReceipt();
      this.QueryBankSumAmount(1);
    } else if (title == '银行对账单') {
      this.QueryBankStatement();
      this.QueryBankSumAmount(2);
      this.setData({
        file_month: app.globalData.curr_date,
      });
    }
  },
  onChangelist(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
  /**
   * 日期选择
   */
  bindDateChange: function (e) {    
    this.setData({
      file_month: e.detail.value,
    })
  },

  chooseFileWeb: function () {
    let that = this;
    let bank_account_number= that.data.bank_account_number;
    let file_month = that.data.file_month;
    my.navigateTo({
      url: "/pages/home/commWebView/commWebView?Utype=1&bank_account_number="+bank_account_number+ "&file_month=" + file_month,
    });
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
        //限制了文件大小和具体文件类型
        if (size > 4194304 || (newfilename.indexOf(".xlsx") == -1 && newfilename.indexOf(".xls") == -1 && newfilename.indexOf(".csv") == -1)) {
          my.showToast({
            title: '文件大小不能超过4MB,格式必须为[xlsx|xls|csv]！',
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
    let customer_info_id = app.globalData.curr_customer_info_id;
    let account_month = app.globalData.curr_date.split('-').join("");
    let customer_name = app.globalData.curr_customer_name;
    if (that.data.filePath == '') {
      util.Toast('请选择上传文件');
      return;
    }
    my.showLoading({
      content: "文件上传中...",
      mask: true,
    })

    let url = api.BillApi.PostBankImport + '?cid=' + customer_info_id + "&cname=" + customer_name + "&account_month=" + account_month + "&bank_num=" + that.data.bank_account_number + "&file_month=" + that.data.file_month;
    my.uploadFile({
      url: url,
      filePath: that.data.filePath,
      fileType: 'image',
      fileName: 'file',
      header: {
        "Content-Type": "multipart/form-data", //记得设置
        'Authorization': 'Bearer ' + my.getStorageSync({ key: 'qh_access_token' }).data
      },
      formData: {
        'cid': customer_info_id,
        'account_month': account_month,
        'cname': customer_name,
        'bank_num': that.data.bank_account_number,
        'file_month': that.data.file_month,
      },
      success: function (res) {
        my.hideLoading();
        var result = JSON.parse(res.data);
        if (result.success == true) {
          util.Toast('上传成功', 'success');
          that.QueryBankStatement();
          that.QueryBankSumAmount(2);
        } else {
          util.Toast(result.msg, 'fail');
        }
      },
      fail: function (res) {
        console.log(res);
      },
    })
  },

  chooseFilePDF: function () {
    let that = this;
    my.chooseMessageFile({
      count: 1, //选择文件的数量
      type: 'file', //选择文件的类型,这里只允许上传文件.还有视频,图片,或者都可以
      success(res) {
        var size = res.tempFiles[0].size;
        var filename = res.tempFiles[0].name;
        var newfilename = filename + "";
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
          that.uploadFilePDF();
        }
      }
    })
  },
  uploadFilePDF: function () {
    let that = this;
    if (that.data.filePath == '') {
      util.Toast('请选择文件上传');
      return;
    }

    let customer_info_id = app.globalData.curr_customer_info_id;
    let customer_name = app.globalData.curr_customer_name;
    let account_month = app.globalData.curr_date.replace("-", "");

    let url = api.BillApi.PostBankImport + '?cid=' + customer_info_id + "&cname=" + customer_name + "&account_month=" + account_month + "&bank_num=" + that.data.bank_account_number;
    my.showLoading({
      content: "文件上传识别中...",
      mask: true,
    })
    my.uploadFile({
      url: url,
      filePath: that.data.filePath,
      fileType: 'image',
      fileName: 'file',
      header: {
        "Content-Type": "application/mspdf", //记得设置
        'Authorization': 'Bearer ' + my.getStorageSync({ key: 'qh_access_token' }).data
      },
      formData: {
        'cid': customer_info_id,
        'account_month': account_month,
        'cname': customer_name,
        'bank_num': that.data.bank_account_number
      },
      success: function (res) {
        my.hideLoading();
        var result = JSON.parse(res.data);
        console.log(result);
        if (result.success == true) {
          util.Toast(result.msg, 'success');
          that.QueryBankReceipt();
          that.QueryBankSumAmount(1);
        } else {
          util.Toast(result.msg, 'fail');
        }
      },
      fail: function (res) {
        console.log(res);
      },
    })
  },

  chooseImg() {
    let that = this;
    my.chooseImage({
      count: 1, // 默认9
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
                imgPath: filePath,
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

    if (that.data.imgPath == '') {
      util.Toast('请选择图片上传');
      return;
    }

    let customer_info_id = app.globalData.curr_customer_info_id;
    let customer_name = app.globalData.curr_customer_name;
    let account_month = app.globalData.curr_date.replace("-", "");
    let bank_account_number = that.data.bank_account_number;
    let url = api.BillApi.PostBankImport + '?cid=' + customer_info_id + "&cname=" + encodeURIComponent(customer_name) + "&account_month=" + account_month + "&bank_num=" + encodeURIComponent(bank_account_number);
    my.showLoading({
      content: "银行回单识别中...",
      mask: true,
    })     
    my.uploadFile({
      url: url,
      filePath: that.data.imgPath,
      fileType: 'image',
      fileName: 'file',
      header: {
        "Content-Type": "multipart/form-data", //记得设置
        'Authorization': 'Bearer ' + my.getStorageSync({ key: 'qh_access_token' }).data
      },
      formData: {
        'cid': customer_info_id,
        'account_month': account_month,
        'cname': customer_name,
        'bank_num': that.data.bank_account_number
      },
      success: function (res) {
        my.hideLoading();
        var result = JSON.parse(res.data);        
        if (result.success == true) {
          util.Toast(result.msg,'success');
          that.QueryBankReceipt();
          that.QueryBankSumAmount(1);
        } else {
          util.Toast(result.msg,'fail');
        }
      },
      fail: function (res) {
        console.log(res);
      },
    })
  },
  /**
   * 查询银行回单数据
   */
  QueryBankReceipt: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    that.setData({
      showloading: true
    })
    util.request(api.BillApi.QueryBankTransData, {
      cid: customer_info_id,
      curr_month: curr_month,
      bank_id: that.data.bank_id,
      type: '银行回单',
      pageSize: that.data.pageSize,
      pageIndex: that.data.pageIndex
    }, 'POST').then(function (res) {      
      if (res.data.success == true) {
        that.setData({
          BankReceiptList: res.data.list,
          msg: []
        });
      } else {
        that.setData({
          BankReceiptList: [],
          msg: '暂无数据'
        });
      }
      that.setData({
        showloading: false
      })
    })
  },
  /**
   * 查询银行流水数据
   */
  QueryBankStatement: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    that.setData({
      showloading: true
    })
    util.request(api.BillApi.QueryBankTransData, {
      cid: customer_info_id,
      curr_month: curr_month,
      bank_id: that.data.bank_id,
      type: '银行流水',
      pageSize: that.data.pageSize,
      pageIndex: that.data.pageIndex
    }, 'POST').then(function (res) {
      console.log(res);
      if (res.data.success == true) {
        that.setData({
          BankStatementList: res.data.list,
          LSmsg: []
        });
      } else {
        that.setData({
          BankStatementList: [],
          LSmsg: '暂无数据'
        });
      }
      that.setData({
        showloading: false
      })
    })
  },
  /**
  * 查询银行流水回单汇总数据
  */
  QueryBankSumAmount: function (type) {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    util.request(api.BillApi.QueryBankSumAmount, {
      cid: customer_info_id,
      curr_month: curr_month,
      bank_id: that.data.bank_id,
      type: type,
      pageSize: that.data.pageSize,
      pageIndex: that.data.pageIndex
    }, 'POST').then(function (res) {
      console.log(res);
      if (res.data.success == true) {
        that.setData({
          dr: res.data.list[0].dr,//出账
          cr: res.data.list[0].cr,//入账
          qty: res.data.list[0].con,
        });
      } else {
        that.setData({
          dr: 0,
          cr: 0,
          qty: 0,
        });
      }
    })
  },
  /**
  * 删除上传文件
  */
  deleteFile: function (event) {
    let that = this;
    let process_recv_file_id = event.currentTarget.dataset.id;
    let data_id = event.currentTarget.dataset.data_id;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    my.confirm({
      title: '提示',
      content: '确定删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          util.request(api.BillApi.PostBankFileDelete, {
            cid: customer_info_id,
            curr_month: curr_month,
            fileid: process_recv_file_id,
            id: data_id,
          }, 'POST').then(function (res) {
            if (res.data == true) {
              util.Toast("删除成功",'success');
              that.QueryBankReceipt();
              that.QueryBankSumAmount(1);
            } else {
              util.Toast(res.data.msg,'fail');
            }
          })
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**
   * 银行流水数据删除
   */
  deleteBankStatement: function (event) {
    let that = this;
    let bank_id = that.data.bank_id;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    my.confirm({
      title: '提示',
      content: '确定删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          util.request(api.BillApi.PostBankStatementDel, {
            cid: customer_info_id,
            curr_month: curr_month,
            bank_id: bank_id
          }, 'POST').then(function (res) {
            if (res.data.success == true) {
              util.Toast("删除成功",'success');
              that.QueryBankStatement();
              that.QueryBankSumAmount(2);
            } else {
              util.Toast(res.data.msg,'fail');
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
