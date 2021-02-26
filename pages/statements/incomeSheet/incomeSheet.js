var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    indexType: 0,
    incomesheetdetaildata: [],
    incomesheetdata: [],
     selectedFlag: [false],
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    this.QueryIncomeSheet();
  },

  /**
   * 利润表查询
   */
  QueryIncomeSheet: function (e) {
    let that = this;
    util.request(api.QueryIncomeSheetUrl, {
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        that.setData({
          incomesheetdata: res.data.incomesheetdata
        });
      } else {
        that.setData({
          incomesheetdata: []
        });
      }

    })

  },
  QueryIncomeSheetDetail: function (item_type) {
    let that = this;

    console.log(item_type, '获取类型');

    util.request(api.QueryIncomeSheetDetailUrl, {
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join(""),
      item_type: item_type
    }, 'POST').then(function (res) {

      console.log(res.data.incomesheetdetaildata, '利润详情');
      if (res.data.success == true) {
        that.setData({
          incomesheetdetaildata: res.data.incomesheetdetaildata
        });
      } else {
        that.setData({
          incomesheetdetaildata: []
        });
      }
    })

  },

  onChange(event) {
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
    this.QueryIncomeSheetDetail(item_type);
  },
});
