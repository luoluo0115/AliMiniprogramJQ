var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    customer_List: [],
    index:[],
    class_type_id:[],
    reload:false,
    value: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  var customer_List= app.globalData.customer_info_id_list;
      for(let i in customer_List){
        customer_List[i].show=false;
      }
      my.setStorage({
        key:'customer_List',
        data:customer_List,
      })
      this.setData({
        customer_List:customer_List//页面加载时 显示所有数据
      })
  },
  input1:function(value){//输入时 时是调用搜索方法
    this.setData({
      value,
    });
    this.search(value)
  },
  confirm1:function(value){//软键盘搜索
    this.setData({
      value,
    });
    this.search(value)
  },
  onClear:function(value){//软键盘搜索
    this.setData({
      value:''
    });
  },
  search: function(key){
    var that= this;
    var customer_List = my.getStorage({
      key: 'customer_List',
      success: (res)=>{
        if(key == ""){
          that.setData({customer_List:res.data})
            return;
        }
        var arr =[];//临时数组 用于存放匹配到的数据
        for( let i in res.data){
          res.data[i].show =false;
          if(res.data[i].customer_name.indexOf(key) >=0 ){
            res.data[i].show = true;
            arr.push(res.data[i])
          }

        }
        if(arr.length==0){
          that.setData({
            customer_List:[{show:true,customer_name:'无相关数据'}]
          })
        }else{
          that.setData({
            customer_List:arr//找到相关数据在页面显示
          })
        }
      },
      fail: ()=>{},
      complete: ()=>{}
    });

  },
  /*点击当前公司*/
  returnPre:function(e){
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    if(app.globalData.customer_info_id_list!=''){
      for(let i in app.globalData.customer_info_id_list){
        if(e.currentTarget.dataset.customer_info_id===app.globalData.customer_info_id_list[i].customer_info_id){
          app.globalData.index=i;
        }
      }
    }
    prevPage.setData({
      customer_info_id: app.globalData.customer_info_id,
       index: app.globalData.index
      })
      app.globalData.curr_customer_info_id=e.currentTarget.dataset.customer_info_id
      app.globalData.refresh=true;
      my.navigateBack({
        delta: 1,
      })
  },
  
});
