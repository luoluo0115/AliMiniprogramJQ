var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    dtData: [],
    date: '',
    cWidth: 750,
    cHeight: 500,
    pixelRatio: 2,
  },
  onLoad() {
    this.setData({
      date: app.globalData.curr_date,
    });
    this.QueryAccountingAnalysis()
  },
  
  QueryAccountingAnalysis: function (e) {
    let that = this
    //财务分析
    util.request(api.QueryAccountingAnalysisUrl, {
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        console.log(res, '财务分析')
        that.setData({
          dtData: res.data.dt[0],
        });
      } else {
        that.setData({
          dtData: []
        });
      }

    });
  },
  initChart: function (F2, config) { // 使用 F2 绘制图表
    const chart = new F2.Chart(config);
    let that = this;
    //财务分析
    util.request(api.QueryAccountingAnalysisUrl, {
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        console.log(res, '财务分析')
        that.setData({
          dtData: res.data.dt[0],
        });
        let dtData = that.data.dtData;
        const dataNum = [{
          brand: '预警上限',
          sales: dtData.column_val_03,
          const: 100
        }, {
          brand: '可增加收入',
          sales: dtData.column_val_03 - dtData.column_val_01,
          const: 100
        }, {
          brand: '开票收入',
          sales: dtData.column_val_01,
          const: 100
        }];
        function numberToMoney(n) {
          return String(Math.floor(n * 100) / 100).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        chart.source(data);
        chart.coord({
          transposed: true
        });
        chart.axis(false);
        chart.tooltip(false);
        chart.interval().position('brand*const').color('#d9e4eb').size(10).animate(false);
        chart.interval().position('brand*sales').color('#1e6ce8').size(10).style({
          radius: [0, 5, 5, 0]
        });
        chart.render();
      } else {
        that.setData({
          dtData: []
        });
      }

    });
  },
  initpieChart: function (F2, config) {
    console.log(config,'config')
    const chart = new F2.Chart(config);
    let that = this;
    //财务分析
    util.request(api.QueryAccountingAnalysisUrl, {
      openid: app.globalData.openid, customer_info_id: app.globalData.curr_customer_info_id,
      account_month: app.globalData.curr_date.split('-').join("")
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        console.log(res, '财务分析')
        that.setData({
          dtData: res.data.dt[0],
        });
        let dtData = that.data.dtData;
        const map = {
          '销售费用': dtData.column_val_19 < 0 ? 0 : dtData.column_val_19,
          '管理费用': dtData.column_val_21 < 0 ? 0 : dtData.column_val_21,
          '财务费用': dtData.column_val_23 < 0 ? 0 : dtData.column_val_23
        };
        const total = (dtData.column_val_19 < 0 ? 0 : dtData.column_val_19) + (dtData.column_val_21 < 0 ? 0 : dtData.column_val_21) + (dtData.column_val_23 < 0 ? 0 : dtData.column_val_23)
        const data = [
          { name: '销售费用', percent: (dtData.column_val_19 < 0 ? 0 : dtData.column_val_19) / total, a: '1' },
          { name: '管理费用', percent: (dtData.column_val_21 < 0 ? 0 : dtData.column_val_21) / total, a: '1' },
          { name: '财务费用', percent: (dtData.column_val_23 < 0 ? 0 : dtData.column_val_23) / total, a: '1' }
        ];
        chart.source(data, {
          percent: {
            formatter: function formatter(val) {
              return val * 100 + '%';
            }
          }
        });
        chart.legend({
          position: 'right',
          itemFormatter: function itemFormatter(val) {
            return val + '  ' + map[val];
          }
        });
        chart.tooltip(false);
        chart.coord('polar', {
          transposed: true,
          radius: 0.85
        });
        chart.axis(false);
        chart.interval()
          .position('a*percent')
          .color('name', ['#FACC14', '#1e6ce8', '#1890FF','#2FC25B', '#13C2C2', '#8543E0'])
          .adjust('stack')
          .style({
            lineWidth: 1,
            stroke: '#fff',
            lineJoin: 'round',
            lineCap: 'round'
          })
          .animate({
            appear: {
              duration: 1200,
              easing: 'bounceOut'
            }
          });
        chart.render();
      } else {
        that.setData({
          dtData: []
        });
      }

    });


  },
 
});
