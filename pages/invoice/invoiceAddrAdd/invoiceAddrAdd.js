var app = getApp();
import util from '../../../utils/util';
var api = require('../../../config/api.js');
Page({
  data: {
    areaList: [],
    val: '选择/省/市/区',
    showArea: false,
    expressData: {
      im_cust_customer_id: 0,
      im_cust_express_id: 0,
      express_contact_name: '',
      express_contact_phone: '',
      province: '',
      city: '',
      district: '',
      express_address: '',
      remark: ''
    },
    im_cust_customer_id: 0,
    type: "Add",
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let im_cust_customer_id = options.im_cust_customer_id;
    let type = options.type;
    if (options.im_cust_customer_id) {
      that.setData({
        im_cust_customer_id: options.im_cust_customer_id,
        type: options.type,
      });
    }
    if (options.item) {
      that.setData({
        expressData: JSON.parse(options.item),
      });
      console.log(that.data.expressData)
    }
    if (type == "Edit") {
      my.setNavigationBar({
        title: '修改地址'
      });
    } else {
      my.setNavigationBar({
        title: '新增地址'
      });
    }
  },

  handleFieldChange: function (e) {
    let that = this;
    let fieldName = e.currentTarget.dataset.fieldName
    let newValue = e.detail.value;

    let field = 'expressData.' + fieldName;
    this.setData({
      [field]: newValue,
    })
  },

  bindSave: function (e) {
    const that = this;
    let customer_info_id = app.globalData.curr_customer_info_id;
    let curr_month = app.globalData.curr_date.replace("-", "");
    let user_name = app.globalData.user_name;
    let im_cust_customer_id = that.data.im_cust_customer_id;

    let express_contact_name = that.data.expressData.express_contact_name;
    let express_contact_phone = that.data.expressData.express_contact_phone;
    let express_address = that.data.expressData.express_address;
    let remark = that.data.expressData.remark;
    let province = that.data.expressData.province;
    let city = that.data.expressData.city;
    let district = that.data.expressData.district;

    if (express_contact_name == null || express_contact_name == undefined || express_contact_name.length <= 0) {
      util.Toast('请输入联系人');
      return;
    }
    if (express_contact_phone == null || express_contact_phone == undefined || express_contact_phone.length <= 0) {
      util.Toast('请输入联系人电话');
      return;
    } else {
      var phonereg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/; //手机号码正则
      if (phonereg.test(express_contact_phone) === false) {
        util.Toast('手机号码格式不正确！');
        return;
      }
    }
    if (province == null || province == undefined || province.length <= 0) {
      util.Toast('请输入省市区');
      return;
    }
    if (express_address == null || express_address == undefined || express_address.length <= 0) {
      util.Toast('请输入详细地址');
      return;
    }
    let formExpressData = {
      im_cust_customer_id: im_cust_customer_id,
      customer_info_id: customer_info_id,
      express_contact_name: express_contact_name,
      express_contact_phone: express_contact_phone,
      express_address: express_address,
      remark: remark,
      province: province,
      city: city,
      district: district,
    };
    util.request(api.BillApi.PostExpress, {
      formExpressData: formExpressData,
      cid: customer_info_id,
      curr_month: curr_month,
      user_name: user_name
    }, 'POST').then(function (res) {
      if (res.data.success == true) {
        util.Toast(res.data.msg, 'success');        
        my.navigateBack({
          delta: 1,
        })
      } else {
        util.Toast(res.data.msg, 'fail');
      }
    })
  },


  onConfirm(val) {
    let selectVal = `${val.detail.values[0].name}${val.detail.values[1].name}${val.detail.values[2].name}`
    let province = val.detail.values[0].name;
    let city = val.detail.values[1].name;
    let district = val.detail.values[2].name;
    this.setData({
      showArea: false,
      val: selectVal,
      ['expressData.province']: province,
      ['expressData.city']: city,
      ['expressData.district']: district,
    })
  },
  selectArea() {
    this.setData({
      showArea: true,      
    })
  },
  onClose() {
    this.setData({
      showArea: false
    });
  },
  cancel() {
    this.setData({
      showArea: false
    });
  },

});
