import api from '../../utils/api';
import { toastMsg, confirmMsg, showTopTips, isMobile, isCarNumber } from '../../utils/util';
import { login } from '../../utils/wx-api';
const app = getApp();
Page({
    data: {
        flag: false,
        showTopTips: false,
        keyboardVisible: false,
        errorMsg: '',
        carNumber: '',
        carNumbers: [],
        carIndex: 0,
        codeText: '获取验证码',
        form: {
            code: '', //验证码
            mobile: '',
            car_number: '',
            avatar: '',
            name: '',
            js_code: '',
            iv: '',
            encryptedData: '',
            is_register: false,
            nick_name: '',
            merchant_id: 0,
            store_id: 0,
            related_id: 0,
            related_type: 0,
            send_mode: 0,
            is_gather: 0,
            is_send: 0,
            staff_id: 0,
            sender_id: 0,
            give_num: 0,
            send_record_id: 0,
            is_user_coupon: 2,
            recommend_user: 0,
            recommend_type: 0 //0无1提供商2顾问3门店4用户
        },
        coupon: {
            name: '',
            storeName: ''
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
     * 获取手机号
     */
    getMobile: function(e) {
        const mobile = e.detail.value;
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
        this.setData({
            'form.code': e.detail.value
        });
    },
    /**
     * 获取联系人姓名
     */
    getContactName: function(e) {
        this.setData({
            'form.name': e.detail.value
        });
    },
    /**
     * 表单验证
     */
    validate: function() {
        if (!(this.data.form.is_register || isMobile(this.data.form.mobile))) {
            return '手机号格式不正确';
        } else if (!this.data.form.is_register && this.data.form.code.length !== 4) {
            return '验证码必须为4位';
        } else if (!isCarNumber(this.data.form.car_number)) {
            return '请填写有效的车牌号';
        } else {
            return '';
        }
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
        wx.showLoading({
            title: '提交请求中'
        });
        api.getRequest('weapp/phonecode', { mobile: this.data.form.mobile }, false).then(res => {
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
     * 跳转到首页
     */
    gotoIndex: function() {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },
    /**
     * 领取优惠券
     */
    getCoupon: function(e) {
        this.setData({
            'form.car_number': this.data.carNumber
        });
        const msg = this.validate();
        if (msg !== '') {
            showTopTips(this, msg);
            return;
        }
        wx.showLoading({
            title: '提交请求中',
            mask: true
        });
        console.log(['get-coupon-form:', this.data.form]);
        api.postRequest('weapp-coupon/get-coupon', this.data.form, false).then(res => {
            wx.hideLoading();
            console.log(['get-coupon-response:', res]);
            if (res.errcode === 0) {
                wx.setStorageSync('sessionkey', res.data);
                toastMsg('领取成功', 'success', 1000, () => {
                    this.gotoIndex();
                });
            } else {
                confirmMsg('', res.errmsg, false, () => {
                    this.gotoIndex();
                });
            }
        });
    },
    //获取微信用户信息
    onGetUserInfo: function(e) {
        const wxUserInfo = wx.getStorageSync('wxUserInfo');
        if (!wxUserInfo) {
            const data = e.detail;
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
        const item = e.currentTarget.id;
        const prop = 'form.' + item;
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
    changeCarNumber(e) {
        const index = e.detail.value;
        if (this.data.carIndex == index) {
            return;
        }
        this.setData({
            carIndex: index,
            'form.car_number': this.data.carNumbers[index]
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const params = JSON.parse(options.params);
        const userData = wx.getStorageSync('userData');
        const defaultCar = !!userData ? userData.user_data.default_car : '';
        const carNumbers = !!userData ? userData.user_data.car : [];
        this.setData({
            'form.merchant_id': params.merchant_id,
            'form.store_id': params.store_id,
            'form.related_id': params.related_id,
            'form.related_type': params.related_type,
            'form.send_mode': params.send_mode,
            'form.is_gather': params.is_gather,
            'form.is_send': params.is_send,
            'form.staff_id': params.staff_id,
            'form.sender_id': params.sender_id,
            'form.give_num': params.give_num,
            'form.send_record_id': params.send_record_id,
            'form.share_uuid': params.share_uuid,
            'form.is_user_coupon': params.is_user_coupon,
            'form.is_register': !!userData && userData.isRegist,
            carNumbers: carNumbers,
            carNumber: defaultCar,
            coupon: {
                name: params.coupon_name,
                storeName: params.store_name,
                deduction_money: params.deduction_money,
                share_img_url: params.share_img_url
            }
        });
        if (carNumbers > 0) {
            const index = carNumbers.indexOf(defaultCar);
            this.setData({ carIndex: index > -1 ? index : 0 });
        }
        this.wxLogin();
    }
});
