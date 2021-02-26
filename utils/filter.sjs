// 支持es4语法
//三位数字加逗号，取两位小数
var filter = {
  numberToFixed: function (val) {
    console.log(val,'numberToFixed')
    if (val >= 0) {
      var str = (val * 100 / 100).toFixed(2) + '';
      var intSum = str.substring(0, str.indexOf("."));
      var intSum = (intSum || 0).toString();
      var resultIntSum = '';

      while (intSum.length > 3) {
        resultIntSum = ',' + intSum.slice(-3) + resultIntSum;
        intSum = intSum.slice(0, intSum.length - 3);
      }
      if (intSum) { resultIntSum = intSum + resultIntSum; }
      var dot = str.substring(str.length, str.indexOf("."))//取到小数部分搜索
      var ret = resultIntSum + dot;
      return ret;
    } else {
      var price = Math.abs(val);
      var str = (price * 100 / 100).toFixed(2) + '';
      var intSum = str.substring(0, str.indexOf("."));
      var intSum = (intSum || 0).toString();
      var resultIntSum = '';

      while (intSum.length > 3) {
        resultIntSum = ',' + intSum.slice(-3) + resultIntSum;
        intSum = intSum.slice(0, intSum.length - 3);

      }
      if (intSum) { resultIntSum = intSum + resultIntSum; }
      var dot = str.substring(str.length, str.indexOf("."))//取到小数部分搜索
      var ret = '-' + (resultIntSum + dot);

      return ret;
    }



  },
  formatDate: function (date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1

    return [year, month].map(Number).join('-') + ' '
  },
  formatMinute: function (strDate, format = "yyyy-MM-dd hh:mm") {
    // 解决ios出现NaN问题
    if (strDate == "" || strDate == null) {
      return '';
    }
    var realDate = strDate ? getDate(strDate.replace(getRegExp('-', 'g'), '/')) : getDate();
    var regYear = getRegExp("(y+)", "i");
    var date = [
      ["M+", realDate.getMonth() + 1],
      ["d+", realDate.getDate()],
      ["h+", realDate.getHours()],
      ["m+", realDate.getMinutes()],
      ["s+", realDate.getSeconds()],
      ["q+", Math.floor((realDate.getMonth() + 3) / 3)],
      ["S+", realDate.getMilliseconds()],
    ];
    var reg1 = regYear.exec(format);
    if (reg1) {
      format = format.replace(reg1[1], (realDate.getFullYear() + '').substring(4 - reg1[1].length));
    }
    for (var i = 0; i < date.length; i++) {
      var v = date[i][1];
      var reg2 = getRegExp("(" + date[i][0] + ")").exec(format);
      if (reg2) {
        format = format.replace(reg2[1], reg2[1].length == 1 ? v : ("00" + date[i][1]).substring(("" + date[i][1]).length));
      }
    }
    return format;
  },
  formatTime: function (strDate, format = "yyyy-MM-dd hh:mm:ss") {
    // 解决ios出现NaN问题
    if (strDate == "" || strDate == null) {
      return '';
    }
    var realDate = strDate ? getDate(strDate.replace(getRegExp('-', 'g'), '/')) : getDate();
    var regYear = getRegExp("(y+)", "i");
    var date = [
      ["M+", realDate.getMonth() + 1],
      ["d+", realDate.getDate()],
      ["h+", realDate.getHours()],
      ["m+", realDate.getMinutes()],
      ["s+", realDate.getSeconds()],
      ["q+", Math.floor((realDate.getMonth() + 3) / 3)],
      ["S+", realDate.getMilliseconds()],
    ];
    var reg1 = regYear.exec(format);
    if (reg1) {
      format = format.replace(reg1[1], (realDate.getFullYear() + '').substring(4 - reg1[1].length));
    }
    for (var i = 0; i < date.length; i++) {
      var v = date[i][1];
      var reg2 = getRegExp("(" + date[i][0] + ")").exec(format);
      if (reg2) {
        format = format.replace(reg2[1], reg2[1].length == 1 ? v : ("00" + date[i][1]).substring(("" + date[i][1]).length));
      }
    }
    return format;
  },
  getStatus: function(status) {
		switch (status) {
			case "N":
				return "新";
			case "R":
				return "拒绝";
			case "S":
				return "提交完成";
			case "B":
				return "开始开票";
			case "E":
				return "结束开票";
			case "P":
				return "打印快递单";
			case "C":
				return "取走发票";
			case "O":
				return "交接";
			case "I":
				return "接收";
			case "L":
				return "档案转出";
			case "M":
				return "客服接收";
			case "X":
				return "取消";
			case "D":
				return "作废";
			default:
				return status;
		}
  },
  splitContent: function (data, i) {
    var arr = data.split('|');
    if (arr.length > i) {
      return arr[i];
    }
    else {
      return "出错了，超过索引的范围！";
    }
  }
}
// 导出对外暴露的属性 
export default {
  numberToFixed: filter.numberToFixed,
  formatDate: filter.formatDate,
  formatTime: filter.formatTime,
  formatMinute: filter.formatMinute,
  getStatus: filter.getStatus,
  splitContent:filter.splitContent
};
