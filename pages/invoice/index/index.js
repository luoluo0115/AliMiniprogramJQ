var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    companyList: '',
    array: '',
    index: 0,
    customer_info_id_list: [],
    curr_customer_name: '',
    curr_customer_info_id: 0,
    topwrapper: false,
    pickerDate: '',
    customer_info_id: [],
    invoiceShow: true,
    sheetShow: false,
    sumReceivableData: [],
    amt_end_Receivable: [],
    year_accumulated_income: '0.00',
    year_accumulated_is: '0.00',
    sumPayData: [],
    amt_end_pay: [],
    sumAdvanceAccountPayableData: [],
    advanceAccountPayable: [],
    sumAdvanceAccountReceivableData: [],
    advanceAccountReceivable: [],
    bank_and_cash: '0.00',
    paid_in_capital: '0.00',
    accounting_software: [],
    totalStock: '0.00',
    msg: [],
    gridsList: [
      {
        icon: '/assets/images/mini/propery-icon.png',
        text: '开票申请',
      }, {
        icon: '/assets/images/mini/icon-change.png',
        text: '进项发票',
      }, {
        icon: '/assets/images/mini/icon-search.png',
        text: '销项发票',
      }, {
        icon: '/assets/images/mini/icon-type.png',
        text: '税金计算器',
      }, {
        icon: '/assets/images/mini/income-icon.png',
        text: '发票库存',
        desc: '0'
      }, {
        icon: '/assets/images/mini/icon-tax.png',
        text: '核定税种',
      }]
  },
  /**
    * 生命周期函数--监听页面加载
    */
  onLoad: function (options) {
    let that = this;
    let list = [];
    if (app.globalData.customer_info_id_list != '') {
      this.setData({
        pickerDate: app.globalData.curr_date,
        customer_info_id_list: app.globalData.customer_info_id_list,
        customer_info_id: app.globalData.curr_customer_info_id,
        index: app.globalData.index,
        topwrapper: true,
      });

    } else {
      this.setData({
        pickerDate: app.globalData.curr_date,
        customer_info_id_list: [],
        customer_info_id: [],
        index: 0,
        topwrapper: true
      });
      util.Toast('暂无客户信息');
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //时间与公司名列表
    var list = [];
    if (app.globalData.customer_info_id_list != '') {
      this.setData({
        array: list,
        pickerDate: app.globalData.curr_date,
        index: app.globalData.index,
        customer_info_id_list: app.globalData.customer_info_id_list,
      });
    } else {
      this.setData({
        array: [],
        pickerDate: app.globalData.curr_date,
        index: 0,
        customer_info_id_list: [],
      });
      util.Toast('暂无客户信息');
    }

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //时间与公司名列表
    var list = [];
    if (app.globalData.customer_info_id_list != '') {
      this.setData({
        array: list,
        pickerDate: app.globalData.curr_date,
        index: app.globalData.index,
        customer_info_id_list: app.globalData.customer_info_id_list,
        curr_customer_info_id: app.globalData.curr_customer_info_id
      });
      //开票查询
      this.getData();
    } else {
      this.setData({
        array: [],
        date: app.globalData.curr_date,
        index: 0,
        customer_info_id_list: [],
        curr_customer_info_id: 0
      });
      util.Toast('暂无客户信息');
    }
  },
  onItemClick: function (event) {
    let index = event.detail.index
    let that = this;
    if (index == 0) {
      util.request(api.BillApi.GetIsInvoiceService, {
        openid: app.globalData.openid,
        customer_info_id: app.globalData.curr_customer_info_id,
        account_month: app.globalData.curr_date.split('-').join(""),
        ui: app.globalData.user_id,
      }, 'POST').then(function (res) {        
        if (res.data.success == true) {
          my.navigateTo({
            url: '/pages/invoice/invoiceInfo/invoiceInfo',
          })
        } else {
          util.Toast("未开通开票服务!");
        }
      })
    } else if (index == 1) {
      my.navigateTo({
        url: '/pages/invoice/ominvoice/ominvoice',
      })
    } else if (index == 2) {
      my.navigateTo({
        url: '/pages/invoice/iminvoice/iminvoice',
      })
    } else if (index == 3) {
      my.navigateTo({
        url: '/pages/invoice/calculateTax/calculateTax',
      })
    } else if (index == 4) {
      my.navigateTo({
        url: '/pages/invoice/imInvoiceStockInventory/imInvoiceStockInventory',
      })
    } else if (index == 5) {
      my.navigateTo({
        url: '/pages/invoice/imInvoiceApprovedType/imInvoiceApprovedType',
      })
    }
  },
  getData: function () {
    Promise.all([this.QueryImInvoiceStatData(), this.QueryImInvoiceStock()]).then(res => {
      my.stopPullDownRefresh()
    });
  },
  //选择时间值
  onPickerDateEvent: function (event) {
    this.setData({
      pickerDate: event.pickerDate,
    })
    app.globalData.curr_date = event.pickerDate;
    this.getData();
  },
  //选择公司值
  onPickerCompanyEvent: function (event) {
    let that = this
    that.setData({
      customer_info_id_list: event.customer_info_id_list,
      curr_customer_info_id: event.curr_customer_info_id,
      curr_customer_name: event.curr_customer_name,
      index: event.index,
    })
    app.globalData.customer_info_id_list = that.data.customer_info_id_list;
    app.globalData.curr_customer_info_id = that.data.curr_customer_info_id;
    app.globalData.curr_customer_name = that.data.curr_customer_name;
    app.globalData.index = that.data.index;
    that.getData();
  },
  QueryImInvoiceStatData: function (e) {
    //开票信息
    let that = this;
    util.request(api.QueryImInvoiceStatDataUrl, {
      openid: app.globalData.openid,
      customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join(""),
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        that.setData({
          iminvoicestatdata: res.data.iminvoicestatdata
        });
      } else {
        that.setData({
          iminvoicestatdata: []
        });
      }

    })
  },
  QueryImInvoiceStock: function (e) {
    //获取发票库存信息
    let that = this;
    util.request(api.QueryImInvoiceStockUrl, {
      openid: app.globalData.openid,
      customer_info_id: app.globalData.curr_customer_info_id
    }, 'POST').then(function (res) {
      console.log(res, '发票库存');
      if (res.data.success == true) {
        that.setData({
          totalStock: res.data.totalStock
        });
      } else {
        that.setData({
          totalStock: 0
        });
      }
    })

  },

  //跳转消息通知
  onGoNoticeWrapper: function (e) {
    my.navigateTo({
      url: '/pages/me/message/message',
    })
  },
  //开票申请
  goInvoice: function () {
    let that = this;
    util.request(api.BillApi.GetIsInvoiceService, {
      openid: app.globalData.openid,
      customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join(""),
      ui: app.globalData.user_id,
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        my.navigateTo({
          url: '/pages/invoice/invoiceInfo/invoiceInfo',
        })
      } else {
        if (res.data.code == "2") {
          my.confirm({
            title: '温馨提示',
            content: '请先关注生活服务号，方便申请开票后给您推送消息通知',
            confirmButtonText: '去关注',
            cancelButtonText: '暂不需要',
            success: (res) => {
              if (res.confirm) {
                my.redirectTo({
                  url: "/pages/home/officialAccount/officialAccount"
                })
              }
            },
          });
        } else {
          util.Toast("未开通开票服务!");
        }
      }
    })
  },
  onTableTap: function () {
    //应收账款
    let that = this;
    util.request(api.QuerySendMailUrl, {
      openid: app.globalData.openid,
      customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        util.Toast(res.data.msg);
      } else {
        util.Toast(res.data.msg);
      }
    })
  },
  QueryAccountReceivable: function (e) {
    //应收账款
    let that = this;
    util.request(api.QueryAccountReceivableUrl, {
      openid: app.globalData.openid,
      customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        that.setData({
          sumReceivableData: res.data.sumData[0],
          amt_end_Receivable: util.priceSwitch(res.data.sumData[0].amt_end)
        });
      } else {
        that.setData({
          sumReceivableData: {
            amt_end: 0.00
          },
          amt_end_Receivable: '0.00'
        });
      }
    })
  },
  QueryAccountPayable: function (e) {
    //应付账款
    let that = this;
    util.request(api.QueryAccountPayableUrl, {
      openid: app.globalData.openid,
      customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {
      console.log(res.data);
      if (res.data.success == true) {
        that.setData({
          sumPayData: res.data.sumData[0],
          amt_end_pay: util.priceSwitch(res.data.sumData[0].amt_end)
        });
      } else {
        that.setData({
          sumPayData: {
            amt_end: 0.00
          },
          amt_end_pay: '0.00'
        });
      }
    })
  },
  QueryTotalIncomeAndIs: function (e) {
    //本年累计收入和利润，货币资金，实收资本
    let that = this;
    util.request(api.QueryTotalIncomeAndIsUrl, {
      openid: app.globalData.openid,
      customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        that.setData({
          year_accumulated_income: util.priceSwitch(res.data.year_accumulated_income),
          year_accumulated_is: util.priceSwitch(res.data.year_accumulated_is),
          bank_and_cash: util.priceSwitch(res.data.bank_and_cash),
          paid_in_capital: util.priceSwitch(res.data.paid_in_capital)
        });
      } else {
        that.setData({
          bank_and_cash: '0.00',
          paid_in_capital: '0.00'
        });
      }

    })
  },
  QueryAdvanceAccountReceivable: function (e) {
    //获取预收账款
    let that = this;
    util.request(api.QueryAdvanceAccountReceivableUrl, {
      openid: app.globalData.openid,
      customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {
      console.log(res, '预收');
      if (res.data.success == true) {
        that.setData({
          advanceAccountReceivable: util.priceSwitch(res.data.sumData[0].amt_begin)
        });
      } else {
        that.setData({
          advanceAccountReceivable: '0.00'
        });
      }
    })

  },
  QueryAdvanceAccountPayable: function (e) {
    //获取预付账款
    let that = this;
    util.request(api.QueryAdvanceAccountPayableUrl, {
      openid: app.globalData.openid,
      customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {
      console.log(res, '预付');
      if (res.data.success == true) {
        that.setData({
          advanceAccountPayable: util.priceSwitch(res.data.sumData[0].amt_end)
        });
      } else {
        that.setData({
          advanceAccountPayable: '0.00'
        });
      }
    })
  },


});
