import { getRequest, postRequest } from '../../utils/api';
import { toastMsg, confirmMsg, showTopTips, isMobile, isCarNumber } from '../../utils/util';
import { login } from '../../utils/wx-api';
const app = getApp();
Page({
    data: {
        flag: true, //标记是否已获取验证码
        showTopTips: false,
        getCodeDisabled: true,
        keyboardVisible: false,
        carNumber: '',
        errorMsg: '',
        codeText: '获取验证码',
        interval: 0,
        form: {
            name: '',
            mobile: '',
            js_code: '',
            car_number: '',
            avatar: '',
            code: '',
            iv: '',
            nick_name: '',
            encryptedData: '',
            recommend_user: 0,
            recommend_type: 0 //0无1提供商2顾问3门店4用户
        }
    },
    /**
     *显示键盘
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
     * 调用发短信接口获取验证码
     */
    getCode: function(e) {
        if (this.data.flag) {
            return;
        }
        if (this.data.form.mobile === '') {
            showTopTips(this, '手机号不能为空');
            return;
        }
        if (!isMobile(this.data.form.mobile)) {
            showTopTips(this, '手机号格式不正确');
            return;
        }
        let time = 60;
        wx.showLoading({ title: '提交请求中' });
        getRequest('weapp/phonecode', { mobile: this.data.form.mobile }, false).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                let interval = setInterval(() => {
                    time--;
                    this.setData({
                        codeText: time + 's后重新获取',
                        flag: true
                    });
                    if (time <= 0) {
                        clearInterval(interval);
                        this.setData({
                            codeText: '获取验证码',
                            flag: false
                        });
                    }
                }, 1000);
            } else {
                confirmMsg('提示', res.errmsg, false);
            }
        });
    },
    /**
     * 获取手机号
     */
    getMobile: function(e) {
        let mobile = e.detail.value;
        if (mobile.length === 11) {
            this.setData({
                flag: false,
                'form.mobile': mobile
            });
        }
    },
    /**
     * 获取输入的验证码
     */
    getInputCode: function(e) {
        this.setData({ 'form.code': e.detail.value });
    },
    /**
     * 表单验证
     */
    validate: function() {
        if (!isMobile(this.data.form.mobile)) {
            return '手机号格式不正确';
        } else if (this.data.form.code.length !== 4) {
            return '验证码必须为4位';
        } else if (!isCarNumber(this.data.form.car_number)) {
            return '请填写有效的车牌号';
        } else {
            return '';
        }
    },
    /**
     * 跳转到首页
     */
    gotoIndex: function() {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },
    /**
     * 登录
     */
    wxLogin: function() {
        login()
            .then(res => {
                if (res.code) {
                    this.setData({ 'form.js_code': res.code });
                } else {
                    console.log('登录失败：' + res.errMsg);
                }
            })
            .catch(res => {
                console.log('登录失败：' + res.errMsg);
            });
    },
    /**
     * 注册
     */
    register: function() {
        wx.showLoading({ title: '提交请求中' });
        postRequest('weapp/signup', this.data.form, false, false).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                toastMsg('注册成功', 'success', 1000, () => {
                    wx.setStorageSync('sessionKey', res.data.sessionKey);
                    this.gotoIndex();
                });
            } else {
                toastMsg(res.errmsg, 'error', 1000, () => {
                    this.gotoIndex();
                });
            }
        }).catch(res=>{
            console.log(res);
            wx.hideLoading();
        });
    },
    /**
     * 注册验证
     */
    onRegister: function(e) {
        this.setData({ 'form.car_number': this.data.carNumber });
        let errMsg = this.validate();
        if (errMsg !== '') {
            showTopTips(this, errMsg);
            return;
        }
        this.register();
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
                this.onRegister();
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
            this.onRegister();
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        if (!!options.userId) {
            this.setData({
                'form.recommend_user': options.userId,
                'form.recommend_type': options.recommendType
            });
        }
        this.wxLogin();
    }
});