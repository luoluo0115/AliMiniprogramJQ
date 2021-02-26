Page({
  data: {
    type:"activity-rule",
    activityShow:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let type=options.type;
    console.log(type,'type');
    let that= this;
    if(type=="active-rule"){
      console.log(1);
      wx.setNavigationBarTitle({
        title: '机巧充值协议'
      })
      that.setData({
        activityShow:true
      })
    }
  },

});
