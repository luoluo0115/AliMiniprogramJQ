var app = getApp();
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
Component({
  mixins: [],
  data: {
    isAuthor: false,//是否已授权
    numindex: 0,
    curr_customer_info_id: 0,
    customer_info_id_list: [],
  },
  props: {
    customerlist: {
      type: Array,
      value: ''
    },
    pickerDate: {
      type: String
    },
    customerindex: {
      type: Number
    },
    onPickerDateEvent: (dateInfo) => { },
    onPickerCompanyEvent: (companyInfo) => {
    },
  },
  didUpdate(prevProps, prevData) {
    this.setData({
      pickerDate: this.props.pickerDate,
    })
  },
  didMount() {
  },
  methods: {
    /* 公司选择
    */
    bindCompanyChange(e) {
      let that = this;
      if (e != undefined) {
        util.request(api.QueryUserCustomerListUrl,//查询所有公司列表
          { openid: app.globalData.openid, user_id: app.globalData.user_id }
          , 'POST').then(function (res) {
            if (res.data.success == true) {
              that.setData({
                customer_info_id_list: res.data.customerList,
                curr_customer_info_id: res.data.customerList[e.detail.value].customer_info_id,
                curr_customer_name: res.data.customerList[e.detail.value].customer_name,
                index: e.detail.value,
              });
            } else {
              that.setData({
                customer_info_id_list: [],
                curr_customer_info_id: 0,
                curr_customer_name: '',
                index: 0
              });
              util.Toast('暂无客户信息');
            }            
            that.props.onPickerCompanyEvent({ index: that.data.index, curr_customer_info_id: that.data.curr_customer_info_id, curr_customer_name: that.data.curr_customer_name, customer_info_id_list: that.data.customer_info_id_list });
          })
      } else {
        let index = app.globalData.index;
        util.request(api.QueryUserCustomerListUrl,//查询所有公司列表
          { openid: app.globalData.openid, user_id: app.globalData.user_id }
          , 'POST').then(function (res) {
            if (res.data.success == true) {
              that.setData({
                customer_info_id_list: res.data.customerList,
                curr_customer_info_id: res.data.customerList[index].customer_info_id,
                curr_customer_name: res.data.customerList[index].customer_name,
                index: index,
              });
            } else {
              that.setData({
                customer_info_id_list: [],
                curr_customer_info_id: 0,
                curr_customer_name: '',
                index: 0
              });
              util.Toast('暂无客户信息');
            }
            that.props.onPickerCompanyEvent({ index: index, curr_customer_info_id: that.data.curr_customer_info_id, curr_customer_name: that.data.curr_customer_name, customer_info_id_list: that.data.customer_info_id_list });
          })
      }
    },
    /* 年月选择
   */
    bindDateChange() {
      let that = this
      my.datePicker({
        format: 'yyyy-MM',
        currentDate: that.props.pickerDate,
        startDate: '2009-09',
        endDate: '2040-09',
        success: (res) => {
          that.setData({
            pickerDate: res.date
          })
          that.props.onPickerDateEvent({ pickerDate: res.date });
          app.globalData.curr_date = res.date;
        },
      });
    },
  },
});
