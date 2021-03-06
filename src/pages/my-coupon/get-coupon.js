import { host } from '../../config';
import api from '../../utils/api';
import { toastMsg, confirmMsg, showTopTips, isMobile, isCarNumber, showLoading } from '../../utils/util';
import { login } from '../../utils/wx-api';
const app = getApp();
Page({
    data: {
        host: host,
        share_img_url: '',
        flag: false,
        showTopTips: false,
        keyboardVisible: false,
        errorMsg: '',
        carNumber: '',
        carNumbers: [],
        carIndex: 0,
        codeText: '获取验证码',
        form: {
            weapp_config_id: 0,
            wechat_config_id: 0,
            auth_related_id: 0,
            auth_type: 0,
            user_id: 0,
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
            staff_id: 0,
            sender_id: 0,
            give_num: 0,
            send_record_id: 0,
            sharable: true,
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
        showLoading('提交请求中');
        api.get(
            'weapp/phonecode',
            {
                mobile: this.data.form.mobile,
                oem_id: app.globalData.extConfig.oem_id || 0,
                auth_type: app.globalData.extConfig.auth_type || 0,
                auth_related_id: app.globalData.extConfig.auth_related_id || 0
            },
            false
        ).then(res => {
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
        api.post('weapp-coupon/get-coupon', this.data.form).then(res => {
            wx.hideLoading();
            console.log(['get-coupon-response:', res]);
            if (res.errcode === 0) {
                wx.setStorageSync('sessionkey', res.data);
                if (!wx.getStorageSync('userData')) {
                    api.get('weapp/get-user-info', {}, false).then(res => {
                        if (res.errcode === 0) {
                            this.setData({
                                userInfo: res.data
                            });
                            wx.setStorageSync('userData', res.data);
                        }
                    });
                }
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
        const carArr = this.data.carNumbers;
        const carSelect = carArr[index];
        this.setData({
            carIndex: index,
            'form.car_number': carSelect,
            carNumber: carSelect
        });
    },
    initData(params) {
        const userData = wx.getStorageSync('userData');
        const defaultCar = !!userData ? userData.default_car : '';
        const carNumbers = !!userData ? userData.car : [];
        this.setData({
            'form.merchant_id': params.merchant_id,
            'form.store_id': params.store_id,
            'form.mobile': userData.mobile,
            'form.related_id': params.related_id,
            'form.related_type': params.related_type,
            'form.send_mode': params.send_mode,
            'form.is_gather': params.is_gather,
            'form.staff_id': params.staff_id,
            'form.sender_id': params.sender_id,
            'form.give_num': params.give_num,
            'form.send_record_id': params.send_record_id,
            'form.share_uuid': params.share_uuid,
            'form.sharable': params.sharable,
            'form.is_register': !!userData && userData.registered,
            'form.weapp_config_id': app.globalData.extConfig.weapp_config_id || 0,
            'form.wechat_config_id': app.globalData.extConfig.wechat_config_id || 0,
            'form.auth_type': app.globalData.extConfig.auth_type || 0,
            'form.auth_related_id': app.globalData.extConfig.auth_related_id || 0,
            'form.recommend_user': params.sender_id || 0,
            'form.recommend_type': params.sender_id ? 4 : 0,
            carNumbers: carNumbers,
            carNumber: carNumbers[0],
            coupon: {
                name: params.coupon_name,
                storeName: params.store_name,
                deduction_money: params.deduction_money,
                share_img_url: params.share_img_url
            },
            share_img_url: params.share_img_url
        });
        // if (carNumbers > 0) {
        //     const index = carNumbers.indexOf(defaultCar);
        //     this.setData({ carIndex: index > -1 ? index : 0 });
        // }
        this.wxLogin();
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.initData(JSON.parse(options.params));
    }
});
