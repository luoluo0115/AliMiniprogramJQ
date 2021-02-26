var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    contractList: [],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     my.setBackgroundColor({
        backgroundColor: '#f5f5f5',
    })
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    let that = this;
    that.QueryMyContract();
  },
  QueryMyContract: function () {
    let that = this;
    util.request(api.QueryMyContract, {
      openid: app.globalData.openid,
      cid: app.globalData.curr_customer_info_id,
      pageSize: 100,
      pageIndex: 1
    }, 'POST').then(function (res) {
      console.log(res)
      if (res.data.success == true) {
        that.setData({
          contractList: res.data.list
        });
      } else {
        that.setData({
          contractList: []
        });
      }
    })
  },
  archiveFile: function (e) {
    var item = e.currentTarget.dataset.item;
    my.downloadFile({
      url: api.FileOssUrl + item.archive_file_guid,
      success: function (res) {
        console.log(res, 'previewPDF')
        const filePath = res.apFilePath;
        my.openDocument({
          filePath: filePath,
          fileType: 'pdf',
          success: function (res) { }
        })
      }
    });
  },
  //回签查看
  seeF: function (e) {
    var item = e.currentTarget.dataset.item;
    let e_flow_Id = item.e_flow_Id;

    util.request(api.PostContractFlowFile, {
      openid: app.globalData.openid,
      cid: app.globalData.curr_customer_info_id,
      flowid: e_flow_Id
    }, 'POST').then(function (res) {
      console.log(res)
      if (res.data.success == true) {
        let url = res.data.url;
        my.downloadFile({
          url: url,
          success: function (res) {
            console.log(res, 'previewPDF')
            const filePath = res.apFilePath;
            my.openDocument({
              filePath: filePath,
              fileType: 'pdf',
              success: function (res) {
              }
            })
          }
        });
      }
    })
  },
  //待签查看
  see: function (e) {
    var item = e.currentTarget.dataset.item;
    let e_file_Id = item.e_file_Id;

    util.request(api.PostContractFile, {
      openid: app.globalData.openid,
      cid: app.globalData.curr_customer_info_id,
      fileid: e_file_Id
    }, 'POST').then(function (res) {
      console.log(res)
      if (res.data.success == true) {
        let url = res.data.url;
        my.downloadFile({
          url: url,
          success: function (res) {
            console.log(res, 'previewPDF')
            const filePath = res.apFilePath;
            my.openDocument({
              filePath: filePath,
              fileType: 'pdf',
              success: function (res) {                
              }
            })
          }
        });
      }
    })
  },
  //签约
  sign: function (e) {
    var item = e.currentTarget.dataset.item;
    let e_flow_Id = item.e_flow_Id;
    let e_account_Id = item.e_account_Id;
    let e_org_Id = item.e_org_Id;

    util.request(api.PostSignContractUrl, {
      openid: app.globalData.openid,
      cid: app.globalData.curr_customer_info_id,
      flowid: e_flow_Id,
      accountid: e_account_Id,
      orgid: e_org_Id,
    }, 'POST').then(function (res) {
      console.log(res)
      if (res.data.success == true) {
        let url = res.data.url;
        my.navigateTo({
          url: '../../me/contractWebView/contractWebView?url=' + url,
          success: function () { },
          fail: function () { },
          complete: function () { }
        })
      } else {
        util.Toast("未找到签约文件!");
      }

    })
  },


});
