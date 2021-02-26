var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');


Page({
  data: {
    drReturn:[],
    q_type:''
  },
  onLoad: function (options) {
    my.setNavigationBar({
      title: options.title

    })
    this.setData({
      q_type:options.q_type
    })
   
    
  },

  onInitChart(F2, config) {
    const chart = new F2.Chart(config);
    let that = this;
    util.request(api.QueryIncomeAndIsByMonthUrl,{
      openid:app.globalData.openid,customer_info_id:app.globalData.curr_customer_info_id,
      account_month:app.globalData.curr_date.split('-').join(""),
      q_type:that.data.q_type
    },'POST').then(function(res){
      console.log(res,'res')
      if(res.data.success==true){
        that.setData({
          drReturn:res.data.drReturn
        })
        const dataNum =  res.data.drReturn;
        let drReturnList= []
        for(var i =dataNum.length-1;i>=0;i--){
          drReturnList[i]= dataNum[i]
          drReturnList[i].val =Number(drReturnList[i].val);
        }
        let data=drReturnList.reverse()
        chart.source(data, {
          value: {
          tickInterval: 750
          }
        });
       chart.tooltip({
        custom: true, // 自定义 tooltip 内容框
        showItemMarker: false,
        onShow: function onShow(ev) {
          var items = ev.items;
          items[0].name = null;
          items[0].name = items[0].title;
          items[0].value = '¥ ' + items[0].value;
        }
      });
      chart.interval().position('month*val').color('l(90) 0:#6823FB 1:#7966FE')
        .style('val', {
          radius: function radius(val) {
            return val > 0 ? [ 4, 4, 0, 0 ] : [ 0, 0, 4, 4 ];
          }
        })
        .adjust('dodge');
        chart.render();
        // 注意：需要把chart return 出来
        return chart;
      }else{
        that.setData({
          drReturn: [],
          q_type:[]
        });
      }
    })
    
  }
});
