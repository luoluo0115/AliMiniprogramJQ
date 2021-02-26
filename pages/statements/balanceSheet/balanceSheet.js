var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    balancesheetdata: [],
    balancesheetdatadetail: [],
    incomesheetdetaildata: [],
    date: '',
    showDetail:false,
    selectedFlag: [false],
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      date: app.globalData.curr_date,
    });
    this.QueryBalanceSheet();
  },
  /**
   * 资产负债表查询
   */
  QueryBalanceSheet: function (e) {
    let that = this;
    util.request(api.QueryBalanceSheetUrl, {
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {

      console.log(res.data.balancesheetdata, '资产负债表列表')
      that.setData({
        balancesheetdata: res.data.balancesheetdata
      });
      app.globalData.cur_type_item = res.data.balancesheetdata.type_item
    })
  },
  //资产负债表详情查询
  QueryBalanceSheetDetail: function (e) {

    let that = this;
    util.request(api.QueryBalanceSheetDetailUrl, {
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join(""),
      item_type: app.globalData.item_type
    }, 'POST').then(function (res) {
      console.log(res.data.balancesheetdatadetail, '资产负债表明细')
      that.setData({
        balancesheetdatadetail: res.data.balancesheetdatadetail
      });
    })

  },
  QueryBalanceSheetDetail: function (item_type) {
    console.log(item_type, '获取类型');
    let that = this;
    util.request(api.QueryBalanceSheetDetailUrl, {
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join(""),
      item_type: item_type
    }, 'POST').then(function (res) {

      console.log(res, '负债表详情');
      if (res.data.success == true) {
        that.setData({
          balancesheetdatadetail: res.data.balancesheetdatadetail
        });
      } else {
        that.setData({
          balancesheetdatadetail: []
        });
      }
    })

  },
  /*点击资产负债表详情*/

  btnclick: function (e) {
    var item_type = e.currentTarget.dataset.item_type;
    var index = e.currentTarget.dataset.index;
    console.log(item_type,'item_type');
    this.setData({
      item_type:e.currentTarget.dataset.item_type
    })
    console.log(index);
    if (index == 0) {
      if (item_type != 'C' & item_type != 'F' & item_type != 'H') {
        this.QueryBalanceSheetDetail(item_type);
      } else {
        this.setData({
          balancesheetdatadetail: []
        });
      }
      index = 1;
    }
  },
  onChange(event) {
    console.log(event,'点击');
    var index = event.currentTarget.dataset.index;
    let active = this.data.active;
    if (this.data.selectedFlag[index]) {
      this.data.selectedFlag[index] = false;
    } else {
      this.data.selectedFlag[index] = true;
    }
    this.setData({
      selectedFlag: this.data.selectedFlag,
      active: index,
    })
     // 如果点击的不是当前展开的项，则关闭当前展开的项
    // 这里就实现了点击一项，隐藏另一项
    if (active !== null && active !== index) {
      this.setData({
        [`selectedFlag[${active}]`]: false,
      });
    }
    var item_type = event.currentTarget.dataset.item_type;
    this.QueryBalanceSheetDetail(item_type);
   
  },

});
