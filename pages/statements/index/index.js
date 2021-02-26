var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    companyList: [],
    array: [],
    index: 0,
    customer_info_id_list: [],
    curr_customer_name: '',
    curr_customer_info_id: 0,
    topwrapper: false,
    pickerDate: [],
    sumReceivableData: [],
    amt_end_Receivable: 0.00,
    year_accumulated_income: '0.00',
    year_accumulated_is: '0.00',
    sumPayData: 0.00,
    amt_end_pay: 0.00,
    sumAdvanceAccountPayableData: 0.00,
    advanceAccountPayable: 0.00,
    sumAdvanceAccountReceivableData: 0.00,
    advanceAccountReceivable: 0.00,
    bank_and_cash: '0.00',
    paid_in_capital: '0.00',
    accounting_software: [],
    totalStock: '0.00',
    msg: [],
    showloading: false,
    gridsList: [
      {
        icon: '/assets/images/mini/icon-bill-01.png',
        text: '资产负债表',
      }, {
        icon: '/assets/images/mini/icon-bill-02.png',
        text: '余额表',
      }, {
        icon: '/assets/images/mini/icon-bill-03.png',
        text: '利润表',
      }, {
        icon: '/assets/images/mini/icon-bill-04.png',
        text: '现金流量表',
      }, {
        icon: '/assets/images/mini/icon-bill-05.png',
        text: '其他应收',
      }, {
        icon: '/assets/images/mini/icon-bill-06.png',
        text: '其他应付',
      }, {
        icon: '/assets/images/mini/icon-bill-08.png',
        text: '财务分析',
      }, {
        icon: '/assets/images/mini/icon-bill-10.png',
        text: '年度账册',
      }, {
        icon: '/assets/images/mini/icon-bill-09.png',
        text: '年度凭证',
      },]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {   
     my.setBackgroundColor({
        backgroundColor: '#f5f5f5',
    }) 
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
    //this.counter.bindCompanyChange();
  },
  //自定义组件实例
  refCompanyInfo(ref) {
    this.counter = ref;
  },

  onItemClick: function (event) {    
    let index = event.detail.index
    if (index == 0) {
      my.navigateTo({
        url: '/pages/statements/balanceSheet/balanceSheet',
      })
    } else if (index == 1) {
      my.navigateTo({
        url: '/pages/statements/Balance/Balance',
      })
    } else if (index == 2) {
      my.navigateTo({
        url: '/pages/statements/incomeSheet/incomeSheet',
      })
    } else if (index == 3) {
      my.navigateTo({
        url: '/pages/statements/cashFlows/cashFlows',
      })
    } else if (index == 4) {
      my.navigateTo({
        url: '/pages/statements/receivableOther/receivableOther',
      })
    } else if (index == 5) {
      my.navigateTo({
        url: '/pages/statements/payableOther/payableOther',
      })
    } else if (index == 6) {
      //util.Toast("功能开发中,敬请期待");
      my.navigateTo({
        url: '/pages/statements/accountingAnalysis/accountingAnalysis',
      })
    } else if (index == 7) {
      my.navigateTo({
        url: '/pages/statements/downloadLog/downloadLog',
      })
    } else {
      my.navigateTo({
        url: '/pages/statements/voucherReport/voucherReport',
      })
    }
  },
  getData: function () {
    Promise.all([this.QueryTotalIncomeAndIs(),this.QueryAccountReceivable(), this.QueryAccountPayable(), this.QueryAdvanceAccountReceivable(), this.QueryAdvanceAccountPayable()]).then(res => {
      my.stopPullDownRefresh()
    });
  },
  //选择公司值
  onPickerDateEvent: function (event) {
    this.setData({
      pickerDate: event.pickerDate,
    })
    app.globalData.curr_date = event.pickerDate;
    this.getData();
  },
  //选择时间值
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
  //跳转消息通知
  onGoNoticeWrapper: function (e) {
    wx.navigateTo({
      url: '/pages/me/message/message',
    })
  },
  onTableTap: function () {
    //应收账款
    let that = this;
    util.request(api.QuerySendMailUrl, {
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
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
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        that.setData({
          sumReceivableData: res.data.sumData[0],
          amt_end_Receivable: util.priceSwitch(res.data.sumData[0].amt_end)
        });
      } else {
        that.setData({
          sumReceivableData: { amt_end: 0.00 },
          amt_end_Receivable: '0.00'
        });
      }

    })
  },
  QueryAccountPayable: function (e) {
    //应付账款
    let that = this;
    util.request(api.QueryAccountPayableUrl, {
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
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
          sumPayData: { amt_end: 0.00 },
          amt_end_pay: '0.00'
        });
      }
    })
  },
  QueryTotalIncomeAndIs: function (e) {
    //本年累计收入和利润，货币资金，实收资本
    let that = this;
    util.request(api.QueryTotalIncomeAndIsUrl, {
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
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
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
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
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
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

  onAnalysis: function (e) {
    util.Toast('尚在开发中，敬请期待~');
  },
  

});
