import api from '../../utils/api';
import { confirmMsg, getUrlArgs, showLoading, toastMsg } from '../../utils/util';
import { makePhoneCall, openLocation, login, getSystemInfo } from '../../utils/wx-api';
const app = getApp();
Page({
    data: {
        loading: false,
        hasExpired: false,
        hasAuth: false,
        SEND_MODE_SHARE: 6, //分享领取
        NOT_USER_COUPON: 2,
        SHARABLE: 1,
        couponWidth: '',
        shareUuid: '',
        coupon: {},
        shareForm: {
            merchant_id: 0,
            store_id: 0,
            related_id: 0,
            related_type: 0,
            sender_id: 0,
            send_record_id: 0,
            give_num: 0,
            staff_id: 0,
            customer_id: 0,
            share_uuid: '',
            is_gather: 2, //不是积客活动
            coupon_name: '',
            store_name: '',
            send_mode: 6,
            sharable: true,

            weapp_config_id: 0,
            wechat_config_id: 0,
            auth_related_id: 0,
            auth_type: 0,
            user_id: 0,
            mobile: '',
            car_number: '',
            avatar: '',
            name: '',
            js_code: '',
            iv: '',
            encryptedData: '',
            nick_name: ''
        },
        is_register: false
    },
    getInfo: function(e) {
        const wxUserInfo = wx.getStorageSync('wxUserInfo');
        if (!wxUserInfo) {
            const data = e.detail;
            if (data.errMsg === 'getUserInfo:ok') {
                this.setData({
                    'shareForm.encryptedData': data.encryptedData,
                    'shareForm.iv': data.iv,
                    'shareForm.avatar': data.userInfo.avatarUrl,
                    'shareForm.nick_name': data.userInfo.nickName
                });
                app.setWxUserCache(data);
                this.hasExpired();
            } else {
                confirmMsg('', '需要微信授权才能登录哦', false);
            }
        } else {
            this.setData({
                'shareForm.encryptedData': wxUserInfo.encryptedData,
                'shareForm.iv': wxUserInfo.iv,
                'shareForm.avatar': wxUserInfo.avatarUrl,
                'shareForm.nick_name': wxUserInfo.nickName
            });
            this.hasExpired();
        }
    },
    /**
     * 检查页面是否过期
     */
    hasExpired: function() {
        const params = {
            send_record_id: this.data.shareForm.send_record_id,
            share_uuid: this.data.shareForm.share_uuid || 0,
            related_id: this.data.shareForm.related_id,
            related_type: this.data.shareForm.related_type
        };
        const userData = wx.getStorageSync('userData');
        api.get('weapp-coupon/has-expired', params, false).then(res => {
            this.setData({ hasExpired: res.errcode === 0 ? res.data : true });
            if (!this.data.hasExpired) {
                this.setData({
                    'shareForm.merchant_id': this.data.coupon.merchant_id,
                    'shareForm.store_id': this.data.coupon.store_id,
                    'shareForm.coupon_name': this.data.coupon.name,
                    'shareForm.store_name': this.data.coupon.store_name,
                    'shareForm.deduction_money': this.data.coupon.deduction_money,
                    'shareForm.share_img_url': this.data.coupon.share_img_url,
                    'shareForm.sharable': this.data.coupon.sharable == this.data.SHARABLE,
                    'shareForm.mobile': userData.mobile,
                    'shareForm.car_number': userData.car_number,
                    'shareForm.weapp_config_id': app.globalData.extConfig.weapp_config_id || 0,
                    'shareForm.wechat_config_id': app.globalData.extConfig.wechat_config_id || 0,
                    'shareForm.auth_type': app.globalData.extConfig.auth_type || 0,
                    'shareForm.auth_related_id': app.globalData.extConfig.auth_related_id || 0,
                    is_register: !!userData && userData.registered
                });
                this.checkStatus();
            } else {
                wx.navigateTo({ url: 'share-expired' });
            }
        });
    },
    /**
     * 用户是否注册登录
     */

    checkStatus() {
        if (!this.data.is_register) {
            confirmMsg('亲', '您还没有注册呢，先注册一下吧', true, () => {
                wx.navigateTo({
                    url: '/pages/register/register'
                });
            });
            return;
        }
        this.getCoupon();
    },
    //领取
    getCoupon: function() {
        wx.showLoading({
            title: '领取中',
            mask: true
        });
        api.post('weapp-coupon/get-coupon', this.data.shareForm).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                wx.setStorageSync('sessionkey', res.data);
                toastMsg('领取成功', 'success', 1000, () => {
                    this.gotoIndex();
                });
            } else {
                confirmMsg('', res.errmsg, true, () => {
                    this.gotoIndex();
                });
            }
        });
    },
    /**
     * 获取优惠券详情
     */
    getDetail: function() {
        const params = {
            related_id: this.data.shareForm.related_id,
            related_type: this.data.shareForm.related_type,
            send_mode: this.data.shareForm.send_mode
        };
        showLoading();
        api.get('weapp-coupon/get-share-detail', params, false)
            .then(res => {
                wx.hideLoading();

                if (res.errcode === 0) {
                    this.setData({
                        coupon: res.data
                    });
                }
            })
            .catch(res => {
                wx.hideLoading();
            });
    },
    /**
     * 添加发送记录
     */
    addSendRecord: function() {
        const coupon = Object.assign({}, this.data.coupon);
        const params = {
            merchant_id: coupon.merchant_id,
            store_id: coupon.store_id,
            related_id: this.data.shareForm.related_id,
            related_type: this.data.shareForm.related_type,
            send_mode: this.data.shareForm.send_mode,
            give_num: this.data.shareForm.give_num,
            staff_id: this.data.shareForm.staff_id,
            is_gather: this.data.shareForm.is_gather,
            customer_id: this.data.shareForm.receiver_customer_id
        };
        api.post('weapp-coupon/add-send-record', params, false).then(res => {
            if (res.errcode === 0) {
                this.setData({ 'shareForm.send_record_id': res.data });
            }
        });
    },
    /**
     * 添加分享记录
     */
    addShareRecord: function() {
        const wxUserInfo = wx.getStorageSync('wxUserInfo');
        const nickName = !wxUserInfo ? '' : wxUserInfo.nickName;
        const params = {
            merchant_id: this.data.coupon.merchant_id,
            store_id: this.data.coupon.store_id,
            related_id: this.data.shareForm.related_id,
            related_type: this.data.shareForm.related_type,
            is_gather: this.data.shareForm.is_gather,
            sender_id: this.data.shareForm.sender_id,
            send_record_id: this.data.shareForm.send_record_id,
            sender_customer_id: this.data.shareForm.sender_customer_id,
            sender_nick_name: nickName,
            share_uuid: this.data.shareForm.share_uuid
        };
        api.post('weapp-coupon/add-share-record', params, false).then(res => {
            if (res.errcode == 0) {
                toastMsg(res.errmsg, 'success', 1000);
            }
            toastMsg(res.errmsg, 'error', 1000);
        });
    },
    /**
     * 获取分享记录唯一标识符
     */
    getShareRecordUuid: function(jsCode) {
        const params = {
            send_record_id: this.data.shareForm.send_record_id,
            js_code: jsCode,
            auth_type: app.globalData.extConfig.auth_type || 1,
            auth_related_id: app.globalData.extConfig.auth_related_id || 1
        };
        api.post('weapp-coupon/get-share-record-uuid', params, false).then(res => {
            if (res.errcode) {
                this.setData({ shareUuid: res.data });
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
    call: function(e) {
        let tel = e.currentTarget.dataset.tel;
        makePhoneCall({
            phoneNumber: tel
        })
            .then(res => {
                console.log('拨打成功');
            })
            .catch(() => {
                console.log('拨打失败');
            });
    },
    /**
     * 定位
     */
    openLocation: function() {
        let params = {
            latitude: parseFloat(this.data.coupon.tencent_latitude),
            longitude: parseFloat(this.data.coupon.tencent_longitude),
            scale: 18,
            name: this.data.coupon.store_name,
            address: this.data.coupon.store_address
        };
        openLocation(params);
    },
    //获取微信用户信息
    onGetUserInfo: function(e) {
        if (e.detail.errMsg === 'getUserInfo:ok') {
            this.setData({ hasAuth: true });
            app.setWxUserCache(e.detail);
        } else {
            confirmMsg('', '需要微信授权才能分享哦', false);
        }
    },
    /**
     * 登录
     */
    wxLogin: function() {
        login()
            .then(res => {
                if (res.code) {
                    this.getShareRecordUuid(res.code);
                } else {
                    console.log('登录失败：' + res.errMsg);
                }
            })
            .catch(res => {
                console.log('登录失败：' + res.errMsg);
            });
    },
    /**
     * 设置优惠券样式
     */
    setCouponStyle() {
        getSystemInfo()
            .then(res => {
                this.setData({
                    couponWidth: res.windowWidth - 30 + 'px'
                });
            })
            .catch(() => {
                this.setData({
                    couponWidth: app.globalData.windowWidth - 30 + 'px'
                });
            });
    },
    initData(params) {
        const wxUserInfo = wx.getStorageSync('wxUserInfo');
        this.setData({
            'shareForm.related_id': params.related_id,
            'shareForm.related_type': params.related_type,
            'shareForm.give_num': params.give_num,
            'shareForm.send_mode': params.send_mode,
            'shareForm.staff_id': params.staff_id || 0,
            'shareForm.is_gather': params.is_gather,
            'shareForm.sender_id': params.sender_id || 0,
            'shareForm.send_record_id': params.send_record_id || 0,
            'shareForm.share_uuid': params.share_uuid || '',
            'shareForm.receiver_customer_id': params.receiver_customer_id || 0,
            hasAuth: !!wxUserInfo
        });
        this.setCouponStyle();
        this.getDetail();

        //发送记录id为空，并且发送方式为分享,则添加发送记录
        if (!params.send_record_id && params.send_mode != this.data.SEND_MODE_SHARE) {
            this.addSendRecord();
        }
        //发送方式为分享
        if (params.send_mode == this.data.SEND_MODE_SHARE) {
            this.wxLogin();
        }
    },
    /**
     * 生成分享地址
、     */
    generateShareUrl() {
        const wxUserInfo = wx.getStorageSync('wxUserInfo');
        const nickName = !wxUserInfo ? '' : wxUserInfo.nickName;
        const params = Object.assign({}, this.data.shareForm);
        const sharedUrl =
            '/pages/my-coupon/share-detail?related_id=' +
            params.related_id +
            '&related_type=' +
            params.related_type +
            '&staff_id=' +
            params.staff_id +
            '&sender_id=' +
            params.sender_id +
            '&send_record_id=' +
            params.send_record_id +
            '&give_num=' +
            params.give_num +
            '&is_gather=' +
            params.is_gather +
            '&share_uuid=' +
            shareUuid +
            '&send_mode=' +
            this.data.SEND_MODE_SHARE;
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let params = null;
        if (options.q) {
            params = getUrlArgs(decodeURIComponent(options.q));
        } else if (options.params) {
            params = JSON.parse(options.params);
        } else {
            params = options;
        }
        this.initData(params);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(res) {
        if (res.from === 'button') {
            this.addShareRecord();
            const sharedUrl = this.generateShareUrl();

            return { title: this.data.coupon.share_title, path: sharedUrl, imageUrl: this.data.coupon.share_img_url };
        }
    }
});
