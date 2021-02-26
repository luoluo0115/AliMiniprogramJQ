var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    balanceData: [],
    account_month: '',
    begin_month: '',
    end_month: '',
    isShowQuery: false,
    isShowDown: false,
    top: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      account_month: app.globalData.curr_date,
      begin_month: app.globalData.curr_date,
      end_month: app.globalData.curr_date,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let customer_info_id = app.globalData.curr_customer_info_id;
    if (customer_info_id != '') {
      this.setData({
        isShowQuery: true
      })
    } else {
      this.setData({
        isShowQuery: false
      })
    }
    this.QueryBalanceSheet()
  },
  //控制回到顶部按钮的显示与消失
  scrollTopFun(e) {
    let that = this;
    that.top = e.detail.scrollTop;

  },
  /**
* 日期选择起始
*/
  bindDateChange: function () {
    let that = this;
    my.datePicker({
      format: 'yyyy-MM',
      currentDate: that.data.account_month,
      startDate: '2000-01',
      endDate: '2100-01',
      success: (res) => {
        that.setData({
          begin_month: res.date
        });
        that.compareDate(that.data.begin_month, that.data.end_month)
      },
    });
  },
  /**
 * 日期选择结束
 */
  bindDateChangeEnd: function (e) {
    let that = this;
    my.datePicker({
      format: 'yyyy-MM',
      currentDate: that.data.account_month,
      startDate: '2000-01',
      endDate: '2100-01',
      success: (res) => {
        that.setData({
          end_month: res.date
        });
        that.compareDate(that.data.begin_month, that.data.end_month)
      },
    });
  },
  /**
 * 判断日期1是否大于日期2，只到年月
 * @param {Object} begin_month
 * @param {Object} end_month
 */
  compareDate: function (begin_month, end_month) {
    console.log(begin_month, 'begin_month')
    console.log(end_month, 'end_month')
    var result = false;
    if (begin_month.substring(0, 4) < end_month.substring(0, 4)) {
      console.log(begin_month.substring(0, 4), 'begin_month.substring(0,4)')
      result = true;
      this.QueryBalanceSheet()
    } else if (begin_month.substring(0, 4) == end_month.substring(0, 4)) {
      if (begin_month.substring(5, 7) <= end_month.substring(5, 7)) {
        console.log(begin_month.substring(5, 7), 'begin_month.substring(5,7)')
        result = true;
        this.QueryBalanceSheet()
      } else {
        util.Toast('起始月份不应大于结束月份');
      }
    } else {
      util.Toast('起始月份不应大于结束月份');
    }
    return result;
  },
  /**
   * 余额表
   */
  QueryBalanceSheet: function (e) {
    let that = this;
    my.showLoading()
    let postData = {
      cid: app.globalData.curr_customer_info_id,
      queryBeginDate: that.data.begin_month,
      queryEndDate: that.data.end_month,
    }
    console.log(postData, 'postData')
    util.request(api.BillApi.QueryBalanceSheet, postData, 'POST').then(function (res) {
      console.log(res, '余额表list')
      if (res.data.success == true) {
        that.setData({
          balanceData: res.data.balanceData,
          isShowDown: true
        });

      } else {
        that.setData({
          balanceData: [],
          isShowDown: false
        });
      }
      my.hideLoading();
    })

  },
  DownExcel: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    if (customer_info_id > 0) {
      my.showLoading()
      let postData = {
        queryBeginDate: that.data.begin_month,
        queryEndDate: that.data.end_month,
        cid: customer_info_id,
        cname: app.globalData.curr_customer_name,
      }
      my.request({
        url: api.BillApi.ExcelBalanceSheetReport,
        data: postData,
        headers: {
          "content-type": "application/json",
          'Authorization': 'Bearer ' + my.getStorageSync({ key: 'qh_access_token' }).data, //设置验证
        },
        method: "get",
        dataType: "json",
        responseType: "arraybuffer",
        success: (result) => {
          console.log("下载成功！", result);
          if (result.success == false) {
            my.showToast({
              content: result.msg,              
              duration: 2000,
            })
          } else {
            var fileManager = my.getFileSystemManager();
            var FilePath = my.env.USER_DATA_PATH + "/" + new Date().getTime() + ".xlsx";
            fileManager.writeFile({
              data: result.data,
              filePath: FilePath,
              encoding: "binary", //编码方式 
              success: result => {
                my.openDocument({ //成功之后直接打开
                  filePath: FilePath,                  
                  fileType: "xlsx",
                  success: result => {
                    console.log("打开文档成功");
                  },
                  fail: err => {
                    console.log("打开文档失败", err);
                  }
                });
                my.hideLoading();
              },
              fail: res => {
                my.showToast({
                  content: '下载失败!',                  
                  duration: 2000,
                })                
              }
            })
            my.hideLoading()
          }

        },
        fail(err) {
          console.log(err)
          my.hideLoading()
        }

      })
    } else {
      my.showToast({
        content: '请选择客户后下载报表!',        
        duration: 2000,
      })
    }

  },


});
