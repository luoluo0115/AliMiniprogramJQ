var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var app = getApp();
Page({
  data: {
    flieUploadUrl: ''
  },
  onLoad(options) {
    let that = this;
    let openid = app.globalData.openid;
    let user_id = app.globalData.user_id;
    let user_name = app.globalData.user_name;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let account_month = app.globalData.curr_date.split('-').join("");
    let customer_name = app.globalData.curr_customer_name;
    console.log(options,'options')
    if (options) {
      var Utype = options.Utype;
      if (Utype == "1") {
        //银行回单、对账单
        let bank_account_number = options.bank_account_number;
        let file_month = options.file_month;
        let flieUploadUrl = api.rootUrlQJZ + "/home/fileUpload?ut=" + Utype + "&cid=" + customer_info_id + "&cname=" + customer_name + "&account_month=" + account_month + "&bank_num=" + bank_account_number + "&file_month=" + file_month + "&ui=" + user_id + "&un=" + user_name;
        console.log(flieUploadUrl, 'flieUploadUrl')
        that.setData({
          flieUploadUrl: flieUploadUrl
        })
      } else if (Utype == "2") {
        //收入发票pdf
        let flieUploadUrl = api.rootUrlQJZ + "/home/fileUpload?ut=" + Utype + "&cid=" + customer_info_id + "&cname=" + customer_name + "&account_month=" + account_month + "&ui=" + user_id + "&un=" + user_name;
        console.log(flieUploadUrl, 'flieUploadUrl')
        that.setData({
          flieUploadUrl: flieUploadUrl
        })
      }
      else if (Utype == "3") {
        //收入发票汇总表excel cvs
        let flieUploadUrl = api.rootUrlQJZ + "/home/fileUpload?ut=" + Utype + "&cid=" + customer_info_id + "&cname=" + customer_name + "&account_month=" + account_month + "&ui=" + user_id + "&un=" + user_name;
        console.log(flieUploadUrl, 'flieUploadUrl')
        that.setData({
          flieUploadUrl: flieUploadUrl
        })
      }
      else if (Utype == "4") {
        //支出发票pdf        
        let type = options.type;
        let payCategory = options.payCategory; //支付方式
        let fytype = options.fytype; //费用类型
        let payid = options.payid; //用户ID
        let payname = options.payname; //用户姓名
        let invoice = options.invoice;;
        let paytype = options.paytype;;
        let upload_from = options.upload_from;
        let flieUploadUrl = api.rootUrlQJZ + "/home/fileUpload?ut=" + Utype + "&cid=" + customer_info_id + "&cname=" + customer_name + "&invoice=" + invoice + "&type=" + type + "&payCategory=" + payCategory + "&fytype=" + fytype + "&payid=" + payid + "&payname=" + payname + "&paytype=" + paytype + "&account_month=" + account_month + "&upload_from=" + upload_from;
        console.log(flieUploadUrl, 'flieUploadUrl')
        that.setData({
          flieUploadUrl: flieUploadUrl
        })
      }
      else if (Utype == "5") {
        //进行认证Excel
        let flieUploadUrl = api.rootUrlQJZ + "/home/fileUpload?ut=" + Utype + "&cid=" + customer_info_id + "&cname=" + customer_name + "&account_month=" + account_month + "&ui=" + user_id + "&un=" + user_name;
        console.log(flieUploadUrl, 'flieUploadUrl')
        that.setData({
          flieUploadUrl: flieUploadUrl
        })
      }
      else if (Utype == "6") {
        //社保缴费证明pdf
        let file_month = options.file_month;
        let flieUploadUrl = api.rootUrlQJZ + "/home/fileUpload?ut=" + Utype + "&cid=" + customer_info_id + "&cname=" + customer_name + "&curr_month=" + account_month+ "&account_month=" + file_month + "&ui=" + user_id + "&un=" + user_name;
        console.log(flieUploadUrl, 'flieUploadUrl')
        that.setData({
          flieUploadUrl: flieUploadUrl
        })
      }
      else if (Utype == "7") {
        //工资、劳务、年终奖excel
        let flieUploadUrl = api.rootUrlQJZ + "/home/fileUpload?ut=" + Utype + "&cid=" + customer_info_id + "&cname=" + customer_name + "&account_month=" + account_month + "&ui=" + user_id + "&un=" + user_name;
        console.log(flieUploadUrl, 'flieUploadUrl')
        that.setData({
          flieUploadUrl: flieUploadUrl
        })
      }
      else if (Utype == "10") {

      }
    }
  },
});
