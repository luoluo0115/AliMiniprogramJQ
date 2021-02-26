var api = require('../../../config/api.js');
var util = require('../../../utils/util.js');
const app = getApp()
Page({
  data: {
    goodPrice: [],
    goodsList: [],
    allGoodsPrice: 0,
    yunPrice: 0,
    allGoodsAndYunPrice: 0,
    goodsJsonStr: "",
    hasNoCoupons: true,
    coupons: [],
    youhuijine: 0, //优惠券金额
    curCoupon: null, // 当前选择使用的优惠券
    isHidden: true,
    token: null,
    showCoupon: false,
    radio: '',
    couponUseList: '',
    coupon_amount: 0,
    couponLength: 0,
    last_amount: 0,
    promotion_coupon_user_id: 0,
    promotion_coupon_id: 0,
    couponUseList1: [],
    list: ['a', 'b', 'c'],
    result: '',
    referral_code: "", //推荐码
    radioPay: '1', //支付方式
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
  onLoad() { },
  onPayChange(event) {
    this.setData({
      radioPay: event.detail.value,
    });    
  },
  //查询优惠券
  QueryMyCoupon: function (e) {
    let that = this;
    util.request(api.QueryPromotionCouponUseUrl, //查询优惠券
      {
        openid: app.globalData.openid,
        user_id: app.globalData.user_id,
        pre_product_id: e.goodsId,
        order_amount: e.price
      }, 'POST').then(function (res) {
        console.log(res, 'res.data.couponUseList');
        if (res.data.success == true) {
          that.setData({
            couponUseList1: res.data.couponUseList,
            couponLength: res.data.couponUseList.length
          });
        } else {
          that.setData({
            couponUseList1: [],
            msg: res.data.msg,
            couponLength: 0
          });
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
        if (par_available_balance >= that.data.goodPrice && available_balance < that.data.goodPrice) {
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
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    let shopList = [];
    let parent_referral_code = my.getStorageSync({ key: 'parent_referral_code' }).data;
    let referral_code = "";
    //立即下单    
    let buyNowInfoMem = my.getStorageSync({ key: 'buyNowInfo' }).data;
    if (buyNowInfoMem && buyNowInfoMem.shopList) {
      shopList = buyNowInfoMem.shopList;
      referral_code = buyNowInfoMem.shopList[0].referral_code;
    }
    if (referral_code == undefined || referral_code == null || referral_code == "") {
      referral_code = parent_referral_code;
    }
    that.setData({
      goodsList: shopList,
      goodPrice: shopList[0].price,
      referral_code: referral_code
    });
    //that.QueryMyCoupon(that.data.goodsList[0]);
    that.QueryCustAccountInfo();
  },
  //立即下单
  createOrder: function (e) {    
    if (this.data.payButtonClicked) {
      my.showToast({
        content: '休息一下~',
        type: 'none'
      })
      return
    }
    this.data.payButtonClicked = true
    setTimeout(() => {
      this.data.payButtonClicked = false
    }, 1000)
    // 防止连续点击--结束
    const that = this;
    let remark = ""; // 备注信息
    let referral_code = ""; //推荐码
    let curr_customer_info_id = that.data.goodsList[0].curr_customer_info_id;
    if (e) {
      remark = e.detail.value.remark; // 备注信息
      referral_code = e.detail.value.referral_code;
    }
    let last_amount = that.data.goodsList[0].price - that.data.coupon_amount;
    that.setData({
      last_amount: last_amount,
    })
    let pay_method = that.data.radioPay;
    let available_balance = that.data.available_balance;
    available_balance = available_balance == undefined ? 0 : available_balance;
    let par_available_balance = that.data.par_available_balance;
    par_available_balance = par_available_balance == undefined ? 0 : par_available_balance;
    if (pay_method == "" || pay_method == null || pay_method == undefined) {
      my.showToast({
        content: '请选择支付方式',
        type: 'none'
      })
      return
    }
    if (pay_method == 2) {
      if (last_amount > available_balance) {
        my.showToast({
          content: '可用余额不足',
          type: 'none'
        })
        return
      }
    }
    if (pay_method == 3) {
      if (last_amount > par_available_balance) {
        my.showToast({
          content: '代理账户可用余额不足',
          type: 'none'
        })
        return
      }
    }
    let postData = {
      openid: app.globalData.openid,
      pre_product_id: that.data.goodsList[0].goodsId,
      order_amount: Number(that.data.last_amount),
      user_id: app.globalData.user_id,
      customer_info_id: curr_customer_info_id,
      pre_product_price_id: that.data.goodsList[0].pre_product_price_id,
      param_data: that.data.goodsList[0].label,
      productConfig: that.data.goodsList[0].propertyProductConfig,
      promotion_coupon_user_id: that.data.promotion_coupon_user_id,
      promotion_coupon_id: that.data.promotion_coupon_id,
      coupon_amount: that.data.coupon_amount,
      remark: remark,
      referralCode: referral_code,

    };
    console.log(postData, 'postData');
    util.request(api.GeneratePreOrderUrl, //生成前置订单
      postData, 'POST').then(function (res) {
        console.log(res, '下单');
        if (res.data.success == true) {
          var orderInfo = res.data.preOrderInfo[0];
          var status = orderInfo.status;
          if (status == "A") {
            if (pay_method == 2) {
              that.orderPay(res.data.preOrderInfo[0]);
            } else if (pay_method == 3) {
              that.orderPay(res.data.preOrderInfo[0]);
            } else {
              that.alipay(res.data.preOrderInfo[0]);
            }
          } else {
            util.Toast('订单未支付成功!');
            my.alert({
              title: "提示",
              content: "该订单价格需要提供企业信息评估后才能付款，请在咨询界面与专属服务人员沟通确认调整价格后支付，谢谢配合！",
              buttonText: "确认",
              success: function () {
                my.redirectTo({
                  url: "../../me/myOrder/myOrder?status=S",
                });
              }
            });
          }
        } else {
          util.Toast('提交订单失败!');
        }
      })
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
      confirmText: "确认支付",
      cancelText: "取消支付",
      success: function (res) {
        console.log(res);
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
                  my.redirectTo({
                    url: "../../me/myOrder/myOrder?status=S",
                  });
                }
              });
            }
          })
        } else {
          my.alert({
            title: "提示",
            content: "订单尚未支付",
            buttonText: "确认",
            success: function (res) {
              my.redirectTo({
                url: "../../me/myOrder/myOrder?status=S",
              });
            }
          });
        }
      }
    });
  },
  //支付宝支付
  alipay: function (event) {
    let pre_order_id = event.pre_order_id;
    let pay_trans_id = event.pay_trans_id;
    let product_name = event.product_name;
    let need_pay_amount = event.need_pay_amount;
    let pay_app_id = event.pay_app_id;
    let appid = app.globalData.AppID;
    console.log("订单信息" + JSON.stringify(event));
    let that = this;
    my.showLoading({
      content: "正在支付",
      mask: true,
    });
    let openid = app.globalData.openid;
    console.log(openid)
    if (!openid || openid == undefined) {
      my.showToast({
        content: "未授权登录.请授权登录后支付!",
        type: 'none'
      });
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
    //预交款
    console.log('data' + JSON.stringify(data))
    util.request(api.AlipayTradeCreate, data, "POST").then(function (res) {
      console.log(res,'tradeNo');
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
            console.log(result,'发起支付');
            if (result.resultCode != 9000) {
              util.Toast("支付失败");
            } else {
              // 跳转到订单详情页面              
              util.Toast('支付成功!');
              // my.alert({
              //   content: '支付成功',
              //   buttonText: '确定',
              //   success: () => {
              //     // 充值支付后跳转到我的页面
              //     my.navigateTo({
              //       url: "../../me/myOrder/myOrder?status=R",
              //     })
              //   }
              // });
            }
          },
          fail: (err) => {
            util.Toast("支付异常");
          },
          complete: (res) => {
            //付款完成
            console.log('complete--',res);
            //支付失败转到待支付订单列表
            if (res.resultCode != 9000) {
              my.alert({
                title: "提示",
                content: "订单尚未支付",
                buttonText: "确认",
                success: function (res) {
                  my.redirectTo({
                    url: "../../me/myOrder/myOrder?status=S",
                  });
                }
              });
              return;
            }
            else if (res.resultCode == 9000) {
              my.redirectTo({
                url: "../../me/myOrder/myOrder?status=R",
              });
              return;
            } else {
              my.navigateBack({
                delta: 2,
              });
            }
          }
        });
      } else {        
        util.Toast(res.data.msg);
      }       
    })
  },

});
