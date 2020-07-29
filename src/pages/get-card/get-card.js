import api from '../../utils/api';
import { toastMsg, confirmMsg, showTopTips, isMobile, isCarNumber } from '../../utils/util';
import { login } from '../../utils/wx-api';
const app = getApp();
Page({
    data: {
        flag: false,
        showTopTips: false,
        keyboardVisible: false,
        registered: false,
        errorMsg: '',
        carNumber: '',
        carNumbers: [],
        carIndex: 0,
        codeText: '获取验证码',
        card: {},
        form: {
            weapp_config_id: 0,
            weapp_config_id: 0,
            user_id: 0,
            url: '',
            js_code: '',
            mobile: '',
            car_number: '',
            avatar: '',
            contactor: '',
            name: '',
            iv: '',
            encryptedData: '',
            nick_name: '',
            level: 1,
            is_new_user: true,
            nick_name: '',
            nick_img: '',
            shareholder_id: 0,
            customer_card_id: 0,
            merchant_id: 0,
            store_id: 0,
            recommend_user: 0,
            recommend_type: 0 //0无1提供商2顾问3门店4用户
        },
        cardForm: {
            merchant_id: 0,
            store_id: 0,
            customer_card_id: 0
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
        this.setData({
            'form.code': e.detail.value
        });
    },
    /**
     * 获取联系人姓名
     */
    getContactName: function(e) {
        this.setData({
            'form.contactor': e.detail.value
        });
    },
    /**
     * 表单验证
     */
    validate: function() {
        if (!(this.data.registered || isMobile(this.data.form.mobile))) {
            return '手机号格式不正确';
        } else if (!this.data.registered && this.data.form.code.length !== 4) {
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
            title: '提交请求中',
            mask: true
        });
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
                    'form.nick_name': data.userInfo.nickName,
                    'form.nick_img': data.userInfo.avatarUrl
                });
                app.setWxUserCache(data);
                this.getCard();
            } else {
                confirmMsg('', '需要微信授权才能登录哦', false);
            }
        } else {
            this.setData({
                'form.encryptedData': wxUserInfo.encryptedData,
                'form.iv': wxUserInfo.iv,
                'form.avatar': wxUserInfo.avatarUrl,
                'form.nick_name': wxUserInfo.nickName,
                'form.nick_img': wxUserInfo.avatarUrl
            });
            this.getCard();
        }
    },
    /**
     * 领取会员卡
     */
    getCard: function() {
        this.setData({
            'form.car_number': this.data.carNumber,
            'form.is_new_user': this.data.registered ? false : true
        });
        let msg = this.validate(this.data.form);
        if (msg !== '') {
            showTopTips(this, msg);
            return;
        }
        wx.showLoading({
            title: '提交请求中',
            mask: true
        });
        api.post('weapp/get-card', this.data.form).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
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
    /**
     * 选择车牌号
     */
    changeCarNumber: function(e) {
        if (this.data.carIndex == e.detail.value) {
            return;
        }
        this.setData({
            carIndex: e.detail.value,
            carNumber: this.data.carNumbers[e.detail.value]
        });
    },
    /**
     * 获取会员卡详情
     */
    getDetail: function() {
        this.setData({
            loading: true
        });
        api.post('weapp/get-share-card-info', this.data.form).then(res => {
            this.setData({
                loading: false
            });
            if (res.errcode === 0) {
                this.setData({
                    card: res.data
                });
                return;
            }
        });
    },
    /**
     * 微信登录获取jscode
     */
    wxLogin() {
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
        let params = JSON.parse(options.params);
        let userData = wx.getStorageSync('userData');
        let defaultCar = !!userData ? userData.default_car : '';
        this.setData({
            'form.url': params.url + '?uuid=' + params.urlUuid,
            'form.merchant_id': params.merchant_id,
            'form.store_id': params.store_id,
            'form.customer_card_id': params.customer_card_id,
            'form.shareholder_id': params.shareholder_id,
            'form.level': params.level,
            'form.weapp_config_id': app.globalData.extConfig.weapp_config_id || 0,
            'form.wechat_config_id': app.globalData.extConfig.wechat_config_id || 0,
            'form.auth_type': app.globalData.extConfig.auth_type || 0,
            'form.auth_related_id': app.globalData.extConfig.auth_related_id || 0,
            cardForm: {
                merchant_id: params.merchant_id,
                store_id: params.store_id,
                customer_card_id: params.customer_card_id
            },
            registered: !!userData && userData.registered,
            carNumbers: !!userData ? userData.car : [],
            carNumber: defaultCar,
            carIndex: 0
        });
        if (this.data.carNumbers.length > 0) {
            const index = this.data.carNumbers.indexOf(defaultCar);
            this.setData({
                carIndex: index > -1 ? index : 0
            });
        }
        this.getDetail();
        if (!this.data.registered) {
            this.wxLogin();
        }
    }
});
