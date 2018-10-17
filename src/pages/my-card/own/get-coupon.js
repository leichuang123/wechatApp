import api from '../../../utils/api';
import { toastMsg, confirmMsg, showTopTips, isMobile, isCarNumber, getPageUrl } from '../../../utils/util';
import { login } from '../../../utils/wx-api';
const app = getApp();
Page({
    data: {
        isExpired: false,
        showTopTips: false,
        keyboardVisible: false,
        carNumber: '',
        errorMsg: '',
        couponInfo: {
            serviceName: '',
            storeName: ''
        },
        form: {
            url: '',
            js_code: '',
            mobile: '',
            car_number: '',
            avatar: '',
            contact: '',
            name: '',
            iv: '',
            nick_name: '',
            encryptedData: '',
            recommend_user: 0,
            recommend_type: 0 //0无1提供商2顾问3门店4用户
        }
    },
    /**
     * 显示键盘
     */
    showKeyboard: function() {
        this.setData({
            keyboardVisible: true
        });
    },
    /**
     * 隐藏键盘
     */
    hideKeyboard: function(e) {
        this.setData({
            keyboardVisible: e.detail.keyboardVisible
        });
    },
    /**
     * 获取车牌号
     */
    getCarNumber: function(e) {
        this.setData({
            carNumber: e.detail.carNumber
        });
    },
    /**
     * 检查页面是否过期
     */
    checkExpire: function() {
        api.getRequest(
            'weapp/checkgivenurl', {
                url: this.data.form.url
            },
            false
        ).then(res => {
            this.setData({
                isExpired: res.errcode === 0 ? false : true
            });
        });
    },
    /**
     * 表单验证
     */
    validate: function() {
        if (!isMobile(this.data.form.mobile)) {
            return '请填写有效的手机号码';
        } else if (!isCarNumber(this.data.form.car_number)) {
            return '请填写有效的车牌号';
        } else {
            return '';
        }
    },

    /**
     * 领取优惠券
     */
    getCoupon: function(e) {
        this.setData({
            'form.car_number': this.data.carNumber
        });
        let msg = this.validate(this.data.form);
        if (msg !== '') {
            showTopTips(this, msg);
            return;
        }
        console.log(this.data.form)
        api.postRequest('weapp/getcoupon', this.data.form).then(res => {
            if (res.errcode === 0) {
                toastMsg('领取成功', 'success');
            } else {
                confirmMsg('', res.errmsg, false);
            }
        });
    },
    /**
     * 跳转到首页
     */
    gotoIndex: function() {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },
    //获取微信用户信息
    onGetUserInfo: function(e) {
        let wxUserInfo = wx.getStorageSync('wxUserInfo');
        if (!wxUserInfo) {
            let data = e.detail;
            if (data.errMsg === 'getUserInfo:ok') {
                this.setData({
                    'form.encryptedData': data.encryptedData,
                    'form.iv': data.iv,
                    'form.avatar': data.userInfo.avatarUrl,
                    'form.nick_name': data.userInfo.nickName
                });
                app.setWxUserCache(data);
                this.getCoupon();
            } else {
                confirmMsg('', '需要微信授权才能登录哦', false);
            }
        } else {
            this.setData({
                'form.encryptedData': wxUserInfo.encryptedData,
                'form.iv': wxUserInfo.iv,
                'form.avatar': wxUserInfo.avatarUrl,
                'form.nick_name': wxUserInfo.nickName
            });
            this.getCoupon();
        }
    },
    /**
     * 获取输入的值
     */
    getInputValue: function(e) {
        let item = e.currentTarget.id;
        let prop = 'form.' + item;
        this.setData({
            [prop]: e.detail.value
        });
    },
    /**
     * 登录
     */
    wxLogin: function() {
        login()
            .then(res => {
                if (res.code) {
                    this.setData({
                        'form.js_code': res.code
                    });
                } else {
                    console.log('登录失败：' + res.errMsg);
                }
            })
            .catch(res => {
                console.log('登录失败：' + res.errMsg);
            });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let params =
            'create_time=' +
            options.create_time +
            '&serviceName=' +
            options.serviceName +
            '&storeName=' +
            options.storeName +
            '&recommendType=' +
            options.recommendType +
            '&recommendId=' +
            options.recommendId;
        let url = '/' + getPageUrl() + '?' + params;
        this.setData({
            'form.url': url,
            'form.recommend_user': options.recommendId,
            'form.recommend_type': options.recommendType,
            couponInfo: {
                serviceName: options.serviceName,
                storeName: options.storeName
            }
        });
        this.checkExpire();
        this.wxLogin();
    }
});