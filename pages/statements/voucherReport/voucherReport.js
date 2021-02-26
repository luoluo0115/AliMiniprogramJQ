var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    account_month: '',
    begin_month: '',
    end_month: '',
    voucherTable: [],
    dtVoucherNo: [],
    imagesList: [],
    FileOssUrl: '',
    showloading: false
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    this.setData({
      account_month: app.globalData.curr_date,
      begin_month: app.globalData.curr_date,
      end_month: app.globalData.curr_date,
      FileOssUrl: api.FileOssUrl
    })
    console.log(app.globalData.curr_date, 'app.globalData.curr_date')
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.QueryVoucherReport()
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
  bindDateChangeEnd: function () {
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
    //this.QueryVoucherReport()
  },
  /**
   * 判断日期1是否大于日期2，只到年月
   * @param {Object} begin_month
   * @param {Object} end_month
   */
  compareDate: function (begin_month, end_month) {
    var result = false;
    if (begin_month.substring(0, 4) < end_month.substring(0, 4)) {
      console.log(begin_month.substring(0, 4), 'begin_month.substring(0,4)')
      result = true;
      this.QueryVoucherReport()
    } else if (begin_month.substring(0, 4) == end_month.substring(0, 4)) {
      if (begin_month.substring(5, 7) <= end_month.substring(5, 7)) {
        console.log(begin_month.substring(5, 7), 'begin_month.substring(5,7)')
        result = true;
        this.QueryVoucherReport()
      } else {
        util.Toast('起始月份不应大于结束月份');
      }
    } else {
      util.Toast('起始月份不应大于结束月份');
    }
    return result;
  },
  /**
   * 查询薪资数据
   */
  QueryVoucherReport: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let postData = {
      // customer_info_id: customer_info_id,
      queryBeginDate: that.data.begin_month,
      queryEndDate: that.data.end_month,
      cid: customer_info_id,
      // cname:app.globalData.curr_customer_name,
      // ui:app.globalData.user_id,
      // un:app.globalData.user_name,
      // curr_month:

    }
    console.log(postData, 'postData')
    util.request(api.BillApi.QueryVoucherReportUrl, postData, 'POST').then(function (res) {
      console.log(res, 'res')
      if (res.data.success == true) {
        that.setData({
          voucherTable: res.data.voucherTable,
          dtVoucherNo: res.data.dtVoucherNo
        });
      } else {
        that.setData({
          voucherTable: [],
          dtVoucherNo: []
        });
      }
      var i = '';
      var j = '';
      var sumlist = []
      var sumlistDX = []
      for (i in that.data.dtVoucherNo) {
        var sum = 0;
        for (j in that.data.voucherTable) {
          if (that.data.dtVoucherNo[i].voucher_no == that.data.voucherTable[j].voucher_no) {
            sum += that.data.voucherTable[j].amt_cr;

          }
          var sumDX = that.DX(sum)
        }
        sumlist.push({ sum, sumDX });
        console.log(sumlist, 'sumlist')

      }
      that.setData({
        sumlist: sumlist
      })
    })

  },
  DX: function (n) {
    if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n))
      return "数据非法";
    var unit = "千百拾亿千百拾万千百拾元角分", str = "";
    n += "00";
    var p = n.indexOf('.');
    if (p >= 0)
      n = n.substring(0, p) + n.substr(p + 1, 2);
    unit = unit.substr(unit.length - n.length);
    for (var i = 0; i < n.length; i++)
      str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i);
    return str.replace(/零(千|百|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万|壹(拾)/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
  },
  /**
   * 预览图片
   */
  previewImage: function (event) {
    var that = this;
    var gl_period_id = event.currentTarget.dataset.item.gl_period_id;
    var voucher_no = event.currentTarget.dataset.item.voucher_no;
    var voucher_bill_qty = event.currentTarget.dataset.item.voucher_bill_qty;
    var src = event.currentTarget.dataset.src; //获取data-src
    let customer_info_id = app.globalData.curr_customer_info_id;
    let postData = { cid: customer_info_id, gl_period_id: gl_period_id, voucher_no: voucher_no }
    util.request(api.BillApi.QueryVoucherImageGuidUrl, postData, 'POST').then(function (res) {
      console.log(res, 'res')
      if (res.data.success == true) {
        that.setData({
          imagesList: res.data.imagesList,
        });
        var imgUrlList = []
        var imagesList = that.data.imagesList
        for (var i in imagesList) {
          imgUrlList.push(that.data.FileOssUrl + imagesList[i].upload_file_guid)
        }
        console.log(imgUrlList, 'imgUrlList')
        //图片预览
        my.previewImage({
          current: src, // 当前显示图片的http链接
          urls: imgUrlList // 需要预览的图片http链接列表
        })
      } else {
        that.setData({
          imagesList: [],
        });

      }

    })

  },
  DownPDF: function () {
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    if (customer_info_id > 0) {
      my.showLoading({
        content: '下载中...',
        delay: 1000,
      });
      let postData = {
        queryBeginDate: that.data.begin_month,
        queryEndDate: that.data.end_month,
        cid: customer_info_id,
        cname: app.globalData.curr_customer_name,
      }
      my.request({
        url: api.BillApi.DownPDFVoucherReportUrl,
        data: postData,
        headers: {
          "content-type": "application/json",
          'Authorization': 'Bearer ' + my.getStorageSync({ key: 'qh_access_token' }).data, //设置验证
        },
        method: "GET",
        dataType: "arraybuffer",
        success: (result) => {
          console.log("下载成功！", result);
          if (result.success == false) {
            my.showToast({
              content: result.msg,
              duration: 2000,
            })
          } else {
            var fileManager = my.getFileSystemManager();
            var FilePath = my.env.USER_DATA_PATH + "/" + new Date().getTime() + ".pdf";
            fileManager.writeFile({
              data: result.data,
              filePath: FilePath,
              encoding: "binary", //编码方式 
              success: result => {
                my.openDocument({ //成功之后直接打开
                  filePath: result.data,
                  showMenu: true,
                  fileType: "pdf",
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
                console.log(res);
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
