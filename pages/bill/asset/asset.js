var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
      tabs2: [{title:'固定资产折旧'},{title:'折旧汇总'}],
      activeTab2: 0,
      active: 0,
      activeNames: ['1'],
      monthlyDepreciationData:[],
      monthlyDepreciationDataTotal:[],
      depreciatedTotal:0.00,
      accTotal:0.00
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      this.QueryAssetMonthlyDepreciation();
  },
   handleTabClick({ index, tabsName }) {
    this.setData({
      [tabsName]: index,
    });
    let title = this.data.tabs2[index].title 
     if(title=='折旧汇总'){
      this.QueryAssetMonthlyDepreciationTotal();
    }else if(title=='固定资产折旧'){
      this.QueryAssetMonthlyDepreciation();
    }   
  },
  handleTabChange({ index, tabsName }) {
    this.setData({
      [tabsName]: index,
    });
    let title = this.data.tabs2[index].title 
     if(title=='折旧汇总'){
      this.QueryAssetMonthlyDepreciationTotal();
    }else if(title=='固定资产折旧'){
      this.QueryAssetMonthlyDepreciation();
    }   
  },
  onChangeFixedAssets(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
  QueryAssetMonthlyDepreciation:function() {
    
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-","");
    console.log(customer_info_id,'customer_info_id')
    console.log(curr_month,'curr_month')
    util.request(api.QueryAssetMonthlyDepreciationUrl,
      {cid:customer_info_id,curr_month:curr_month}
      ,'POST').then(function(res){
        if(res.data.success==true){
          that.setData({
            monthlyDepreciationData:res.data.monthlyDepreciationData
          });
          console.log(res.data.monthlyDepreciationData , "固定资产");
        }else{
          that.setData({
            monthlyDepreciationData:[]
          });
        }
      })
     
  },
  QueryAssetMonthlyDepreciationTotal:function() {
    
    let that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.split('-').join("");;
    util.request(api.QueryAssetMonthlyDepreciationTotalUrl,
      {cid:customer_info_id,curr_month:curr_month}
      ,'POST').then(function(res){
        if(res.data.success==true){
          that.setData({
            monthlyDepreciationDataTotal:res.data.monthlyDepreciationDataTotal
          });
          that.dataSum()
          console.log(res , "折旧资产汇总");
        }else{
          that.setData({
            monthlyDepreciationDataTotal:[]
          });
        }
      })
     
  },
dataSum: function() {
    let that=this;
    var depreciatedTotal = 0;
    var accTotal = 0
    if (that.data.monthlyDepreciationDataTotal.length > 0) {
    for (var i = 0; i < that.data.monthlyDepreciationDataTotal.length; i++) {
      depreciatedTotal += parseFloat((that.data.monthlyDepreciationDataTotal[i].depreciated_value).toFixed(2));
      accTotal += parseFloat((that.data.monthlyDepreciationDataTotal[i].acc_value).toFixed(2));
    }
    }
    depreciatedTotal = parseFloat(depreciatedTotal.toFixed(2));
    accTotal= parseFloat(accTotal.toFixed(2));
    that.setData({
      depreciatedTotal: depreciatedTotal,
      accTotal: accTotal
    })
  
  },

});
