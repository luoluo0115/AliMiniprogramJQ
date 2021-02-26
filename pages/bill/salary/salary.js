var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    tabs2: [
      {
        title: '工资奖金',
      },
      {
        title: '员工资料',
      },
      {
        title: '社保公积金收据',
      }
    ],
    curr_status: '',
    FileOssUrl: api.FileOssUrl,
    processRuncard: {
      process_recv_info_id: 0,
      recv_status: ""
    },
    salaryList: [], //工资奖金
    employeeList: [], //员工资料
    socialList: [], //社保公积金
    activeNames: [],
    active: 0,
    srcSocial: '',
    srcPdfSocial: '',
    srcHousingFund: '',
    show: false,
    account_month: util.LastMonth(),
    showModal: false,
    btnDisabled: false,
    bill_tax_amt: 0, //个人总额
    bill_non_tax_amt: 0, //单位总额
    trans_amount: 0, //总额
    process_recv_file_id: 0, //修改文件ID
    act_file_data: '',
  },
  handleTabClick({ index, tabsName }) {
    this.setData({
      [tabsName]: index,
    });
    my.setNavigationBar({
      title: this.data.tabs2[index].title,
    })
  },
  handleTabChange({ index, tabsName }) {
    this.setData({
      [tabsName]: index,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    my.setBackgroundColor({
      backgroundColor: '#f5f5f5',
    })
    let tabs = options.tabs;
    if (tabs == 1) {
      this.setData({
        active: 1,
      })
    }
    this.setData({
      account_month: app.globalData.curr_date,
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      curr_status: my.getStorageSync({ key: 'curr_status' }).data, //当前做账状态
    });
    this.getData();
  },
  getData: function () {
    Promise.all([this.QuerySalary(), this.QueryEmployee(), this.QuerySocial()]).then(res => {
      my.stopPullDownRefresh()
    });
  },
  onChange: function (e) {
  },

  /**
   * 查询薪资数据
   */
  QuerySalary: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    util.request(api.BillApi.QueryMonthlySalary, {
      cid: customer_info_id,
      salary_month: curr_month
    }, 'POST').then(function (res) {
      that.setData({
        processRuncard: {
          process_recv_info_id: 0,
          recv_status: ""
        }
      });
      if (res.data.success == true) {
        that.setData({
          salaryList: res.data.salaryData,
          processRuncard: res.data.processRuncard[0]
        });
      } else {
        that.setData({
          salaryList: []
        });
      }
    })

  },
  /**
   * 查询员工资料
   */
  QueryEmployee: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    util.request(api.BillApi.QueryEmployee, {
      cid: customer_info_id,
      salary_month: curr_month,
      pageSize: 100,
      pageIndex: 1
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        that.setData({
          employeeList: res.data.list,
        });
      } else {
        that.setData({
          employeeList: []
        });
      }
      console.log(that.data.employeeList)
    })

  },
  /**
   * 查询社保公积金
   */
  QuerySocial: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    util.request(api.BillApi.QuerySocial, {
      cid: customer_info_id,
      curr_month: curr_month,
    }, 'POST').then(function (res) {
      console.log(res, '社保')
      if (res.data.success == true) {
        that.setData({
          socialList: res.data.socialData,
        });
      } else {
        that.setData({
          socialList: []
        });
      }
    })
  },
  /**
   * 复制上月薪资
   */
  copySalary: function (item) {
    var self = this;
    var process_recv_info_id = self.data.processRuncard.process_recv_info_id;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    let user_id = app.globalData.user_id;
    let user_name = app.globalData.user_name;
    my.confirm({
      title: '提示',
      content: '确认复制上月薪资吗？',
      success: function (sm) {
        if (sm.confirm) {
          var copyData = {
            process_recv_info_id: process_recv_info_id
          };
          util.request(api.BillApi.PostCopySalary, {
            process_recv_info_id: process_recv_info_id,
            cid: customer_info_id,
            curr_month: curr_month,
            ui: user_id,
            un: user_name
          }, 'POST').then(function (res) {
            if (res.data.success == true) {
              self.QuerySalary();
              util.Toast(res.data.msg, 'success');
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
   * 生成薪资
   */
  generateSalary: function (item) {
    var self = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    let user_id = app.globalData.user_id;
    let user_name = app.globalData.user_name;
    var process_recv_info_id = self.data.processRuncard.process_recv_info_id;
    var recv_status = self.data.processRuncard.recv_status;
    my.confirm({
      title: '提示',
      content: '确认生成当月薪资吗？',
      success: function (sm) {
        if (sm.confirm) {
          var generateData = {
            confirm_salary_user_id: item.confirm_salary_user_id
          };
          util.request(api.BillApi.PostGenerateSalary, {
            cid: customer_info_id,
            curr_month: curr_month,
            ui: user_id,
            un: user_name
          }, 'POST').then(function (res) {
            if (res.data.success == true) {
              self.QuerySalary();
              util.Toast(res.data.msg, 'success');
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
   * 删除薪资
   */
  deleteSalary: function (e) {
    var self = this;
    var item = e.currentTarget.dataset.item;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    let user_id = app.globalData.user_id;
    var process_recv_info_id = self.data.processRuncard.process_recv_info_id;
    var recv_status = self.data.processRuncard.recv_status;
    my.confirm({
      title: '提示',
      content: '确认删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          var deleteData = {
            hr_monthly_salary_id: item.hr_monthly_salary_id
          };
          console.log(deleteData)
          util.request(api.BillApi.PostDeleteSalary, deleteData, 'POST').then(function (res) {
            if (res.data.success == true) {
              self.QuerySalary();
              util.Toast("删除成功", 'success');
            } else {
              util.Toast(res.data.msg, 'fail');
            }
          })
        } else if (sm.cancel) { }
      }
    })
  },

  /**
   * 删除员工资料
   */
  deleteEmp: function (e) {
    var self = this;
    var item = e.currentTarget.dataset.item;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    let user_id = app.globalData.user_id;
    my.confirm({
      title: '提示',
      content: '确认删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          var deleteData = {
            hr_employee_id: item.hr_employee_id
          };
          util.request(api.BillApi.PostDeleteEmployee, deleteData, 'POST').then(function (res) {
            if (res.data.success == true) {
              self.QueryEmployee();
              util.Toast("删除成功", 'success');
            } else {
              util.Toast(res.data.msg, 'fail');
            }
          })
        } else if (sm.cancel) { }
      }
    })
  },

  /**
   * 删除社保公积金
   */
  deleteSocial: function (e) {
    var self = this;
    var item = e.currentTarget.dataset.item;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    let user_id = app.globalData.user_id;
    my.confirm({
      title: '提示',
      content: '确认删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          var deleteData = {
            process_recv_file_id: item.process_recv_file_id
          };
          util.request(api.BillApi.PostDeleteSocial, deleteData, 'POST').then(function (res) {
            if (res.data.success == true) {
              self.QuerySocial();
              util.Toast("删除成功", 'success');
            } else {
              util.Toast(res.data.msg, 'fail');
            }
          })
        } else if (sm.cancel) { }
      }
    })
  },

  /**
   * 日期选择
   */
  bindDateChange() {
    let that = this;
    my.datePicker({
      format: 'yyyy-MM',
      currentDate: that.data.account_month,
      startDate: '2000-01',
      endDate: '2100-01',
      success: (res) => {
        that.setData({
          account_month: res.date
        });
      },
    });
  },
  handleFieldChange: function (e) {
    let that = this;
    let fieldname = e.currentTarget.dataset.fieldName
    let newValue = e.detail.value;
    that.setData({
      [fieldname]: newValue,
    })
    if (fieldname == "bill_non_tax_amt") {
      that.socialChange();
    }
  },
  socialChange: function () {
    let that = this;
    let trans_amount = that.data.trans_amount;
    let bill_non_tax_amt = that.data.bill_non_tax_amt;
    let bill_tax_amt = (trans_amount - bill_non_tax_amt).toFixed(2);
    that.setData({
      bill_tax_amt: bill_tax_amt
    })
  },
  //编辑社保金额
  editSocial: function (e) {
    console.log(e, '编辑社保金额')
    let data = e.currentTarget.dataset.item
    this.setData({
      showModal: true,
      btnDisabled: false,
      bill_tax_amt: data.bill_tax_amt, //个人总额
      bill_non_tax_amt: data.bill_non_tax_amt, //单位总额
      trans_amount: data.trans_amount, //总额
      process_recv_file_id: data.process_recv_file_id,
      act_file_data: data.act_file_data,
    })
  },
  /**
   * 编辑保存社保公积金
   */
  bindSave: function (e) {
    const that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    let user_name = app.globalData.user_name;
    let process_recv_file_id = that.data.process_recv_file_id;

    let act_file_data = that.data.act_file_data;
    let trans_amount = that.data.trans_amount;
    let bill_non_tax_amt = that.data.bill_non_tax_amt;
    let bill_tax_amt = that.data.bill_tax_amt;

    if (bill_tax_amt == "" || bill_tax_amt < 0) {
      util.Toast("个人金额错误!");
      return
    }
    if (bill_non_tax_amt == "" || bill_non_tax_amt < 0) {
      util.Toast("单位金额错误");
      return
    }

    let formData = {
      process_recv_file_id: process_recv_file_id,
      cid: customer_info_id,
      curr_month: curr_month,
      user_name: user_name,
      act_file_data: act_file_data,
      trans_amount: trans_amount,
      bill_non_tax_amt: bill_non_tax_amt,
      bill_tax_amt: bill_tax_amt,
    };
    that.setData({
      btnDisabled: true,
    })
    util.request(api.BillApi.PostUpdateSocial, formData, 'POST').then(function (res) {
      if (res.data.success == true) {
        util.Toast(res.data.msg, 'success');
        that.QuerySocial();
        that.setData({
          showModal: false,
        })
      } else {
        util.Toast(res.data.msg, 'fail');
      }
      that.setData({
        btnDisabled: false,
      })
    })
  },
  //关闭社保金额弹窗
  onModalClose() {
    this.setData({
      showModal: false,
    });
  },
  /**
   * 编辑薪资
   */
  gotoEditSalary: function (e) {
    var item = e.currentTarget.dataset.item;
    my.navigateTo({
      url: '/pages/bill/salary-add/salary-add?type=edit&item=' + JSON.stringify(item),
    })
  },
  /**
   * 新增薪资
   */
  gotoAddSalary: function () {
    my.navigateTo({
      url: '/pages/bill/salary-add/salary-add',
    })
  },
  /**
   * 新增员工
   */
  gotoAddEmp: function () {
    my.navigateTo({
      url: '/pages/bill/employee/employee',
    })
  },
  /**
   * 编辑员工
   */
  gotoEditEmp: function (e) {
    var item = e.currentTarget.dataset.item;
    my.navigateTo({
      url: '/pages/bill/employee/employee?type=edit&item=' + JSON.stringify(item),
    })
  },
  /**
   * 上传薪资
   */
  gotoUpload: function () {
    my.navigateTo({
      url: '/pages/bill/salary-upload/salary-upload',
    })
  },
  gotoSalaryExcel: function () {
    my.navigateTo({
      url: '/pages/bill/salaryExcel/salaryExcel',
    })
  },

  //上传社保缴费证明PDF
  choosePDFSocialWeb() {
    let that = this;
    let account_month = that.data.account_month;
    if (account_month == null || account_month == undefined || account_month.length <= 0) {
      util.Toast('请选择票据月份！');
      return;
    }
    my.navigateTo({
      url: "/pages/home/commWebView/commWebView?Utype=6&file_month=" + account_month,
    });
  },
  /**
   * 上传社保
   */
  chooseImgSocial() {
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
                srcSocial: filePath,
              })
              //开始上传
              that.uploadSocial();
            }

          }
        })
      }
    })
  },
  uploadSocial: function (event) {
    let that = this;
    if (that.data.account_month == null || that.data.account_month == undefined || that.data.account_month.length <= 0) {
      util.Toast('请选择票据月份！');
      return;
    }
    if (that.data.srcSocial == '') {
      util.Toast('请选择社保图片上传');
      return;
    }
    let account_month = that.data.account_month;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let customer_name = app.globalData.curr_customer_name;
    let curr_month = app.globalData.curr_date.replace("-", "");
    let un = app.globalData.user_name;
    let ui = app.globalData.user_id;

    let url = api.BillApi.PostSocialInsuranceOCR + "?cid=" + customer_info_id + "&cname=" + encodeURIComponent(customer_name) + "&account_month=" + account_month + "&curr_month=" + curr_month + "&ui=" + ui + "&un=" + encodeURIComponent(un);

    my.showLoading({
      mask: true,
      content: '社保识别中...'
    });
    my.uploadFile({
      url: url,
      filePath: that.data.srcSocial,
      fileType: 'image',
      fileName: 'file',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + my.getStorageSync({ key: 'qh_access_token' }).data
      },
      formData: {
        'cid': customer_info_id,
        'cname': customer_name,
        'account_month': account_month,
        'curr_month': curr_month,
        'un': un,
        'ui': ui,
      },
      success: function (res) {
        my.hideLoading();
        var result = JSON.parse(res.data);
        if (result.success == true) {
          that.QuerySocial();
          util.Toast(result.msg, 'success');
        } else if (result.success == false) {
          util.Toast(result.msg, 'fail');
        }
      },
      fail: function (res) {
        console.log(res);
      },
    })
  },

  /**
   * 上传公积金
   */
  chooseImgHousingFund() {
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
              // tempFilePath可以作为img标签的src属性显示图片
              that.setData({
                srcHousingFund: filePath,
              })
              //开始上传
              that.uploadHousingFund();
            }
          }
        })
      }
    })
  },
  uploadHousingFund: function (event) {
    let that = this;
    if (that.data.account_month == null || that.data.account_month == undefined || that.data.account_month.length <= 0) {
      util.Toast('请选择票据月份！');
      return;
    }
    if (that.data.srcHousingFund == '') {
      util.Toast('请选择公积金图片上传');
      return;
    }
    let account_month = that.data.account_month;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let customer_name = app.globalData.curr_customer_name;
    let curr_month = app.globalData.curr_date.replace("-", "");
    let un = app.globalData.user_name;
    let ui = app.globalData.user_id;

    let url = api.BillApi.PostHousingFundOCR + "?cid=" + customer_info_id + "&cname=" + encodeURIComponent(customer_name) + "&account_month=" + account_month + "&curr_month=" + curr_month + "&ui=" + ui + "&un=" + encodeURIComponent(un);

    my.showLoading({
      mask: true,
      content: '公积金识别中...'
    });
    my.uploadFile({
      url: url,
      filePath: that.data.srcHousingFund,
      fileType: 'image',
      fileName: 'file',
      header: {
        "Content-Type": "multipart/form-data",
        'Authorization': 'Bearer ' + my.getStorageSync({ key: 'qh_access_token' }).data
      },
      formData: {
        'cid': customer_info_id,
        'cname': customer_name,
        'account_month': account_month,
        'curr_month': curr_month,
        'un': un,
        'ui': ui,
      },
      success: function (res) {
        my.hideLoading();
        var result = JSON.parse(res.data);
        if (result.success == true) {
          that.QuerySocial();
          util.Toast(result.msg, 'success');
        } else if (result.success == false) {
          util.Toast(result.msg, 'fail');
        }
      },
      fail: function (res) {
        console.log(res);
      },
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
  },
});
