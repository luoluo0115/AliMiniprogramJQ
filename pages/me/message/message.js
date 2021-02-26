var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    tabs2: [],
    msg: "",
    dataSourceList: [], //消息分类
    message_source: '',
    MessageList: [],//消息列表
    active: 0,
  },


  /**
   * 
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.QueryMessageSource();
  },
  handleTabClick({ index, tabsName }) {
    console.log(index)
    this.setData({
      [tabsName]: index,
    });
    let title = this.data.tabs2[index].title
    this.setData({
      message_source: title
    })
    this.RefreshMessage();
  },
  handleTabChange({ index, tabsName }) {
    this.setData({
      [tabsName]: index,
    });
    let title = this.data.tabs2[index].title
    this.setData({
      message_source: title
    })
    this.RefreshMessage();
  },

  /**
   * 查询消息分类
   */
  QueryMessageSource: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    util.request(api.QueryMessageSource, {
      cid: customer_info_id,
      curr_month: curr_month
    }, 'POST').then(function (res) {
      let dataSourceList = res.data.list       
      if (res.data.success == true) {
        var item = dataSourceList.map((ele, index) => {
          return {
            title: ele.code_name
          }
        })
        that.setData({
          dataSourceList: res.data.list,
          message_source: res.data.list[0].code_no,
          tabs2: item,
        });
        that.RefreshMessage();
      } else {
        that.setData({
          dataSourceList: [],
          message_source: '',
        });
      }
    })
  },
  /**
   * 查询消息列表
   */
  RefreshMessage: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let user_id = app.globalData.user_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    let message_source = that.data.message_source;
    util.request(api.RefreshMessage, {
      cid: customer_info_id,
      curr_month: curr_month,
      ui: user_id,
      message_source: message_source,
      pageSize: 100,
      pageIndex: 1
    }, 'POST').then(function (res) {
      console.log(res)
      if (res.data.success == true) {
        that.setData({
          MessageList: res.data.list,
        });
      } else {
        that.setData({
          MessageList: [],
          msg: "暂无数据"
        });
      }
    })

  },
  /**
   * 阅读消息
   */
  readMessage: function (e) {
    let that = this;
    let message_user_id = e.currentTarget.dataset.message_user_id
    let customer_info_id = app.globalData.curr_customer_info_id;
    let user_id = app.globalData.user_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    util.request(api.ReadMessageById, {
      cid: customer_info_id,
      curr_month: curr_month,
      ui: user_id,
      message_user_id: message_user_id,
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        that.RefreshMessage();
      }
    })

  },
});
