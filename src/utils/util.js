const errorImagePath = '/assets/images/error.png';
const successImagePath = '/assets/images/success.png';
/**
 * 时间格式化
 */
const formatTime = (date, withTime = true) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    if (withTime) {
        return (
            [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
        );
    }
    return [year, month, day].map(formatNumber).join('-');
};

const formatNumber = n => {
    n = n.toString();
    return n[1] ? n : '0' + n;
};
/**
 * 获取日期
 */
const getDate = count => {
    const dd = new Date();
    if (count) {
        dd.setDate(dd.getDate() + count);
    }
    const year = dd.getFullYear();
    const month = dd.getMonth() + 1;
    const day = dd.getDate();
    return [year, month, day].map(formatNumber).join('-');
};
/**
 * 根据日起获取是星期几
 */
const getDayOfWeek = date => {
    const weeks = ['日', '一', '二', '三', '四', '五', '六'];
    const day = new Date(Date.parse(date.replace(/-/g, '/')));
    return weeks[day.getDay()];
};
/**
 * 验证某个时间是否在一段时间范围内
 */
const withinTimeRange = (startTime, endTime, currentTime) => {
    let startStr = startTime.split(':'),
        endStr = endTime.split(':'),
        currentStr = currentTime.split(':');
    if (startStr.length !== 2) {
        return false;
    }
    if (endStr.length !== 2) {
        return false;
    }
    if (currentStr.length !== 2) {
        return false;
    }
    let startDate = new Date(),
        endDate = new Date(),
        currentDate = new Date();
    startDate.setHours(startStr[0]);
    startDate.setMinutes(startStr[1]);
    endDate.setHours(endStr[0]);
    endDate.setMinutes(endStr[1]);
    currentDate.setHours(currentStr[0]);
    currentDate.setMinutes(currentStr[1]);
    if (currentDate.getTime() - startDate.getTime() >= 0 && currentDate.getTime() - endDate.getTime() <= 0) {
        return true;
    } else {
        return false;
    }
};
/**
 * 页面返回跳转
 */
const goBack = deep => {
    wx.navigateBack({
        delta: deep
    });
};
/**
 * 信息提示
 */
const toastMsg = (msg, msgType, time, callback) => {
    let image = msgType === 'error' ? errorImagePath : successImagePath;
    wx.showToast({
        title: msg,
        icon: 'success',
        image: image,
        duration: time ? time : 1000,
        success: () => {
            setTimeout(() => {
                if (typeof callback === 'function') {
                    callback();
                }
            }, time);
        }
    });
};
/**
 * 确认对话框
 */
const confirmMsg = (title, msg, showCancel, confirm, cancel) => {
    wx.showModal({
        title: title,
        content: msg,
        showCancel: showCancel,
        confirmColor: '#E60103',
        success: res => {
            if (res.confirm) {
                if (typeof confirm === 'function') {
                    confirm();
                }
            } else if (res.cancel) {
                if (typeof cancel === 'function') {
                    cancel();
                }
            }
        },
        fail: () => {
            if (typeof cancel === 'function') {
                cancel();
            }
        }
    });
};
/**
 * 显示错误信息
 */
const showTopTips = (that, msg) => {
    that.setData({
        showTopTips: true,
        errorMsg: msg
    });
    setTimeout(() => {
        that.setData({
            showTopTips: false
        });
    }, 1000);
};
/**
 * 获取页面路径
 */
const getPageUrl = (delta = 0) => {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1 - delta];
    const url = currentPage.route;
    return url;
};
/**
 * 获取带参数的页面路径
 */
const getCurrentPageUrlWithArgs = () => {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const url = currentPage.route;
    const options = currentPage.options;

    let urlWithArgs = url + '?';
    for (let key in options) {
        let value = options[key];
        urlWithArgs += key + '=' + value + '&';
    }
    urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1);

    return urlWithArgs;
};
/**
 * JSON数据类型判断
 */
const isJSON = str => {
    if (typeof str !== 'string') {
        return false;
    }
    str = str.replace(/\s/g, '').replace(/\n|\r/, '');
    if (/^\{(.*?)\}$/.test(str)) return /"(.*?)":(.*?)/g.test(str);
    if (/^\[(.*?)\]$/.test(str)) {
        return str
            .replace(/^\[/, '')
            .replace(/\]$/, '')
            .replace(/},{/g, '}\n{')
            .split(/\n/)
            .map(function(s) {
                return isJSON(s);
            })
            .reduce(function(prev, curr) {
                return !!curr;
            });
    }
    return false;
};
/**
 * 判断数据类型
 */
const checkDataType = (type, obj) => {
    let dataType = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && dataType === type;
};
/**
 * 手机号验证
 */
const isMobile = mobile => {
    let reg = /^1[3-9]\d{9}$/;
    return reg.test(mobile);
};
/**
 * 车牌号验证
 */
const isCarNumber = carNumber => {
    // let reg = /^[京津冀晋蒙辽吉黑沪苏浙皖闽赣鲁豫鄂湘粤桂琼川贵云渝藏陕甘青宁新使领]{1}[A-Z]{1}[A-Z0-9]{4,5}[A-Z0-9挂学警港澳]{1}$/;
    // return reg.test(carNumber);

    return carNumber.length >= 7;
};

/**
 * 生成36位唯一标识符
 */
const uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
/**
 * 获取url查询参数并拼接成对象
 */
const getUrlArgs = url => {
    let name, value;
    let str = url;
    let num = str.indexOf('?');
    str = str.substr(num + 1);

    let arr = str.split('&');
    let argObj = {};
    for (let i = 0; i < arr.length; i++) {
        num = arr[i].indexOf('=');
        if (num > 0) {
            name = arr[i].substring(0, num);
            value = arr[i].substr(num + 1);
            argObj[name] = value;
        }
    }
    return argObj;
};

const showLoading = (title = '加载中...', showMask = true, succeed, fail) => {
    wx.showLoading({
        title: title,
        mask: showMask,
        success: () => {
            typeof succeed === 'function' && succeed();
        },
        fail: () => {
            typeof fail === 'function' && fail();
        }
    });
};
module.exports = {
    formatTime: formatTime,
    goBack: goBack,
    getDate: getDate,
    getDayOfWeek: getDayOfWeek,
    withinTimeRange: withinTimeRange,
    toastMsg: toastMsg,
    confirmMsg: confirmMsg,
    showTopTips: showTopTips,
    getPageUrl: getPageUrl,
    getCurrentPageUrlWithArgs: getCurrentPageUrlWithArgs,
    isJSON: isJSON,
    checkDataType: checkDataType,
    isMobile: isMobile,
    isCarNumber: isCarNumber,
    formatNumber: formatNumber,
    uuid: uuid,
    getUrlArgs: getUrlArgs,
    showLoading: showLoading
};
