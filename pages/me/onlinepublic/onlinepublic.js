var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
     showScrap: false,

  },
  onLoad() {},
  //关闭弹窗
  closeScrap: function () {
    this.setData({
      showScrap: false,
    })
  },
  scrapApplyDiv: function (e) {
    var that = this;
    that.setData({
      showScrap: true,
    })
  },
  /* 年月选择
   */
  bindDateChange() {
    let that = this
    let curr_date = util.LastMonth(new Date());
    my.datePicker({
      format: 'yyyy-MM',
      currentDate: curr_date,
      startDate: '2009-09',
      endDate: '2040-09',
      success: (res) => {
        that.setData({
          pickerDate: res.date
        })
       
      },
    });
  },
});
