var util = require('./utils/util.js');
var utilMd5 = require('./utils/md5.js');
App({
  md5Key: "",
  is_on_launch: true,
  onLaunch(options) {
    var that = this;
    var yymmdd = util.formatDateUnderLine(new Date());
    var md5key = utilMd5.hexMD5('COMMON_TOKEN_' + yymmdd).toUpperCase();
    that.md5Key = md5key;

    my.getSystemInfo({
      success: e => {
        // 设计稿一般是 750 rpx, 但是 canvas 是 px;
        // 1rpx 转换成 px 的时候
        this.globalData.rpx2px = 1 / 750 * e.windowWidth;
      }
    });
    if (my.canIUse('getUpdateManager')) {
      const updateManager = my.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            my.confirm({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            my.confirm({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
            })
          })
        }
      })
    } else {
      my.confirm({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },

  globalData: {
    userInfo: null,
    curr_customer_info_id: '',
    index: 0,
    customer_info_id_list: '',
    is_on_show: true,
    curr_date:'',
    refresh:false,
  }
});
