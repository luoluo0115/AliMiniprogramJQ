var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    tabs2: [{ title: '未支付' }, { title: '已付款' }
    ],    
    orderList: [],
    active: 0,
    status: "S",
    isHidden: true,
    token: null,
    showPayWay: false,
    radioPay: '1',
    payDataInfo: {}, //支付信息
    pay_amount: 0, //应付金额
    available_balance: 0, //可用余额
    balance_amt: 0, //账户金额
    reserve_amt: 0, //账户预留金额
    customer_name: '',//账户名称
    par_balance_amt: 0, //代理账户金额
    par_reserve_amt: 0, //代理账户预留金额
    par_available_balance: 0, //代理账户可用余额
    par_customer_name: '', //代理账户名称
    agent_pay: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let that = this;
    if (options.status != undefined) {
      that.QueryMyOrder(options.status)
    } else {
      that.QueryMyOrder(that.data.status)
    }
  },
  /*选择支付方式*/
  goPayWay: function (event) {
    this.QueryCustAccountInfo();
    let dataInfo = event.currentTarget.dataset.item;
    let pre_order_id = dataInfo.pre_order_id;
    let pay_trans_id = dataInfo.pay_trans_id;
    let product_name = dataInfo.product_name;
    let need_pay_amount = dataInfo.need_pay_amount;
    this.setData({
      showPayWay: true,
      pay_amount: need_pay_amount,
      payDataInfo: dataInfo,
    })
  },
  onPayChange(event) {
    this.setData({
      radioPay: event.detail.value,
    });
  },
  onClick(event) {
    const {
      name
    } = event.currentTarget.dataset;
    this.setData({
      radioPay: name,
    });
  },
  onClose() {
    this.setData({
      showPayWay: false
    });
  },
  handleTabClick({ index, tabsName }) {
    this.setData({
      [tabsName]: index,
    });
    let title = this.data.tabs2[index].title
    if (title == '未支付') {
      this.QueryMyOrder('S')
    } else if (title == '已付款') {
      this.QueryMyOrder('R')
    } else {
      this.QueryMyOrder('C')
    }
  },
  handleTabChange({ index, tabsName }) {
    this.setData({
      [tabsName]: index,
    });
    let title = this.data.tabs2[index].title
    if (title == '未支付') {
      this.QueryMyOrder('S')
    } else if (title == '已付款') {
      this.QueryMyOrder('R')
    } else {
      this.QueryMyOrder('C')
    }
  },


  //我的订单
  QueryMyOrder: function (e) {
    let that = this;
    if (e == 'R') {
      that.setData({
        active: 1
      })
    }
    util.request(api.QueryMyOrderUrl, //查询我的订单
      {
        openid: app.globalData.openid,
        user_id: app.globalData.user_id,
        status: e
      }, 'POST').then(function (res) {
        if (res.data.success == true) {
          that.setData({
            orderList: res.data.orderList,
          });
          console.log(res.data.orderList, 'orderList')
        } else {
          that.setData({
            msg: res.data.msg,
            orderList: [],
          });
        }
      })
  },
  onTapProductDetail: function (event) {
    let item_id = event.currentTarget.dataset.item_id
    if (item_id > 0) {
      my.navigateTo({
        url: '../../product/productDetail/productDetail?product_id=' + item_id
      })
    }
  },
  onCancel: function (event) {
    let pre_order_id = event.currentTarget.dataset.pre_order_id;
    let that = this;
    my.confirm({
      title: '提示',
      content: '确定取消该订单吗？',
      success: function (sm) {
        if (sm.confirm) {
          util.request(api.DeletePreOrderUrl, //删除未付款查询订单
            {
              openid: app.globalData.openid,
              user_id: app.globalData.user_id,
              pre_order_id: pre_order_id
            }, 'POST').then(function (res) {
              if (res.data.success == true) {
                that.QueryMyOrder('S')
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

  toPayTap: function (e) {
    if (this.data.payButtonClicked) {
      util.Toast("休息一下");
      return
    }
    this.data.payButtonClicked = true
    setTimeout(() => {
      this.data.payButtonClicked = false
    }, 1000)
    // 防止连续点击--结束

    const that = this;
    let dataInfo = that.data.payDataInfo;
    let pay_method = that.data.radioPay;
    let pay_amount = that.data.pay_amount;
    pay_amount = pay_amount == undefined ? 0 : pay_amount;
    let available_balance = that.data.available_balance;
    available_balance = available_balance == undefined ? 0 : available_balance;
    let par_available_balance = that.data.par_available_balance;
    par_available_balance = par_available_balance == undefined ? 0 : par_available_balance;
    if (pay_method == "" || pay_method == null || pay_method == undefined) {
      util.Toast("请选择支付方式");
      return
    }
    if (pay_method == 2) {
      if (pay_amount > available_balance) {
        util.Toast("可用余额不足");
        return
      }
    }
    if (pay_method == 3) {
      if (pay_amount > par_available_balance) {
        util.Toast("代理账户可用余额不足");
        return
      }
    }
    if (pay_method == 2) {
      that.orderPay(dataInfo);
    } else if (pay_method == 3) {
      that.orderPay(dataInfo);
    } else {
      that.alipay(dataInfo);
    }
  },

  //订单支付
  orderPay: function (event) {
    let cid = app.globalData.curr_customer_info_id;
    let ui = app.globalData.user_id;
    let pre_order_id = event.pre_order_id;
    let pay_trans_id = event.pay_trans_id;
    let product_name = event.product_name;
    let need_pay_amount = event.need_pay_amount;
    let pay_app_id = event.pay_app_id;
    let appid = app.globalData.AppID;
    let openid = app.globalData.openid;
    let that = this;
    let _msg = '订单金额: ' + need_pay_amount + ' 元'
    if (that.data.available_balance > 0 && that.data.radioPay == 2) {
      _msg += ',可用余额为 ' + that.data.available_balance + ' 元'
    }
    if (that.data.par_available_balance > 0 && that.data.radioPay == 3) {
      _msg += ',代理账户余额为 ' + (that.data.par_available_balance) + ' 元'
    }
    my.confirm({
      title: '请确认支付',
      content: _msg,
      confirmButtonText: "确认支付",
      cancelButtonText: "取消支付",
      success: function (res) {
        if (res.confirm) {
          my.showLoading({
            content: "订单支付中",
            mask: true,
          });
          var data = {
            openid: openid,
            pre_order_id: pre_order_id,
            pay_trans_id: pay_trans_id,
            pay_method: that.data.radioPay,
            money: need_pay_amount,
            cid: cid,
            ui: ui,
          }
          util.request(api.PostOrderAffirmPay, data, "POST").then(function (res) {
            console.log(res);
            my.hideLoading();
            if (res.data.success == true) {
              util.Toast(res.data.msg);
              my.redirectTo({
                url: "../../me/myOrder/myOrder?status=R",
              });
            } else {
              util.Toast(res.data.msg);
              my.alert({
                title: "提示",
                content: "订单支付失败",
                buttonText: "确认",
                success: function (res) {
                  if (res.confirm) {
                    my.redirectTo({
                      url: "../../me/myOrder/myOrder?status=S",
                    });
                  }
                }
              });
            }
            this.setData({
              showPayWay: false
            });
          })
        } else {
          my.showToast({
            content: "订单取消支付",
            type: 'none'
          })
        }
      }
    });
  },
  //支付宝支付
  alipay: function (event) {
    let dataInfo = event;
    let pre_order_id = dataInfo.pre_order_id;
    let pay_trans_id = dataInfo.pay_trans_id;
    let product_name = dataInfo.product_name;
    let need_pay_amount = dataInfo.need_pay_amount;
    let pay_app_id = dataInfo.pay_app_id;
    let appid = app.globalData.AppID;
    let that = this;
    my.showLoading({
      content: "正在支付",
      mask: true,
    });
    let openid = app.globalData.openid;
    if (!openid || openid == undefined) {
      util.Toast("未授权登录.请授权登录后支付!");
      return;
    }
    let status = dataInfo.status;
    if (!status || status != "A") {
      my.hideLoading();
      util.Toast('订单不能支付,请联系管理员调整价格后支付!');
      return;
    }
    var data = {
      openid: openid,
      money: need_pay_amount,
      name: product_name,
      id: pay_trans_id,
      orderType: 'BA',
      pay_app_id: pay_app_id,
      appid: appid
    }
    console.log(data)
    //预交款
    util.request(api.AlipayTradeCreate, data, "POST").then(function (res) {
      console.log(res);
      my.hideLoading();
      if (res.data.success == true) {
        if (!res.data.trade_no) {
          util.Toast('没有获取到tradeNo');
          return;
        }
        let tradeNo = res.data.trade_no;
        //发起支付
        my.tradePay({
          tradeNO: tradeNo,
          success: (result) => {
            console.log(result, '发起支付');
            if (result.resultCode != 9000) {
              util.Toast("支付失败");
            } else {
              util.Toast('支付成功!');
              that.QueryMyOrder('S')
            }
          },
          fail: (err) => {
            util.Toast("支付异常");
          },
          complete: (res) => {
            //支付失败转到待支付订单列表                                 
            if (res.resultCode != 9000) {
              my.alert({
                title: "提示",
                content: "订单尚未支付",
                buttonText: "确认",
                success: function (res) {
                  if (res.confirm) {
                    my.redirectTo({
                      url: "/pages/me/myOrder/myOrder?status=S",
                    });
                  }
                }
              });
              this.setData({
                showPayWay: false
              });
              return;
            }
          }
        });
      } else {
        util.Toast(res.data.msg);
      }
    })
  },

  //账户余额
  QueryCustAccountInfo: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let user_id = app.globalData.user_id;
    let user_name = app.globalData.user_name;
    let curr_month = app.globalData.curr_date.replace("-", "");
    util.request(api.QueryCustAccountInfo, {
      cid: customer_info_id,
      ui: user_id,
      un: user_name,
      curr_month: curr_month
    }, 'POST').then(function (res) {
      console.log(res, 'res.data.QueryCustAccountInfo');
      if (res.data.success == true) {
        let par_balance_amt = 0;
        let par_reserve_amt = 0;
        let par_available_balance = 0;
        let par_customer_name = '';
        let balance_amt = res.data.custAccountInfo[0].balance_amt;
        let reserve_amt = res.data.custAccountInfo[0].reserve_amt;
        let available_balance = res.data.custAccountInfo[0].available_balance;
        let customer_name = res.data.custAccountInfo[0].customer_name;
        if (res.data.custAgentPay.length > 0) {
          par_balance_amt = res.data.custAgentPay[0].balance_amt;
          par_reserve_amt = res.data.custAgentPay[0].reserve_amt;
          par_available_balance = res.data.custAgentPay[0].available_balance;
          par_customer_name = res.data.custAgentPay[0].customer_name;
        }
        let agent_pay = false;
        if (par_available_balance >= that.data.pay_amount && available_balance < that.data.pay_amount) {
          agent_pay = true;
        }
        that.setData({
          available_balance: available_balance,
          balance_amt: balance_amt,
          reserve_amt: reserve_amt,
          customer_name: customer_name,
          par_balance_amt: par_balance_amt,
          par_reserve_amt: par_reserve_amt,
          par_available_balance: par_available_balance,
          par_customer_name: par_customer_name,
          agent_pay: agent_pay,
        });
      } else {
        that.setData({
          available_balance: 0,
          balance_amt: 0,
          reserve_amt: 0,
          par_balance_amt: 0,
          par_reserve_amt: 0,
          par_available_balance: 0,
          agent_pay: false,
        });
      }
    })
  },

});
