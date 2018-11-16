import api from '../../utils/api';
import { confirmMsg, getUrlArgs, showLoading } from '../../utils/util';
import { makePhoneCall, openLocation, login, getSystemInfo } from '../../utils/wx-api';
const app = getApp();
Page({
    data: {
        loading: false,
        hasExpired: false,
        hasAuth: false,
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
            sender_nick_name: '',
            is_send: 1,
            has_send_record: 2,
            is_user_coupon: 2,
            coupon_name: '',
            store_name: '',
            send_mode: 6
        }
    },
    /**
     * 检查页面是否过期
     */
    hasExpired: function() {
        const params = {
            send_record_id: this.data.shareForm.send_record_id,
            share_uuid: !this.data.shareForm.share_uuid ? 0 : this.data.shareForm.share_uuid,
            related_id: this.data.shareForm.related_id,
            related_type: this.data.shareForm.related_type,
            is_send: this.data.shareForm.is_send
        };
        console.log(['hasExpired:', params]);
        api.get('weapp-coupon/has-expired', params, false).then(res => {
            console.log(['hasExpired response: ', res]);
            this.setData({ hasExpired: res.errcode === 0 ? res.data : true });
            if (!this.data.hasExpired) {
                this.setData({
                    'shareForm.coupon_name': this.data.coupon.name,
                    'shareForm.store_name': this.data.coupon.store_name,
                    'shareForm.deduction_money': this.data.coupon.deduction_money,
                    'shareForm.share_img_url': this.data.coupon.share_img_url
                });
                const params = JSON.stringify(this.data.shareForm);
                wx.navigateTo({ url: 'get-coupon?params=' + params });
            } else {
                wx.navigateTo({ url: 'share-expired' });
            }
        });
    },
    /**
     * 获取优惠券详情
     */
    getDetail: function() {
        const params = {
            related_id: this.data.shareForm.related_id,
            related_type: this.data.shareForm.related_type
        };
        showLoading();
        api.get('weapp-coupon/get-share-detail', params, false)
            .then(res => {
                console.log(['getDetail response: ', res]);
                if (res.errcode === 0) {
                    this.setData({
                        coupon: res.data
                    });
                }
            })
            .catch(res => {
                console.log(['getDetail response-catch: ', res]);
            });
    },
    /**
     * 添加发送记录
     */
    addSendRecord: function() {
        const params = {
            merchant_id: this.data.shareForm.merchant_id,
            store_id: this.data.shareForm.store_id,
            related_id: this.data.shareForm.related_id,
            related_type: this.data.shareForm.related_type,
            send_mode: this.data.shareForm.send_mode,
            give_num: this.data.shareForm.give_num,
            staff_id: this.data.shareForm.staff_id,
            is_gather: this.data.shareForm.is_gather,
            customer_id: this.data.shareForm.sender_customer_id
        };
        console.log(['addSendRecord-params:', params]);
        api.post('weapp-coupon/add-send-record', params, false).then(res => {
            console.log(['addSendRecord response: ', res]);
            if (res.errcode === 0) {
                this.setData({ 'shareForm.send_record_id': res.data });
            }
        });
    },
    /**
     * 添加分享记录
     */
    addShareRecord: function() {
        const params = {
            merchant_id: this.data.shareForm.merchant_id,
            store_id: this.data.shareForm.store_id,
            related_id: this.data.shareForm.related_id,
            related_type: this.data.shareForm.related_type,
            is_gather: this.data.shareForm.is_gather,
            sender_id: this.data.shareForm.sender_id,
            send_record_id: this.data.shareForm.send_record_id,
            sender_customer_id: this.data.shareForm.sender_customer_id,
            sender_nick_name: nickName,
            share_uuid: this.data.shareForm.share_uuid
        };
        console.log(['addShareRecord-params:', params]);
        api.post('weapp-coupon/add-share-record', params, false).then(res => {
            console.log(['addShareRecord response: ', res.errmsg]);
        });
    },
    /**
     * 获取分享记录唯一标识符
     */
    getShareRecordUuid: function(jsCode) {
        const params = { send_record_id: this.data.shareForm.send_record_id, js_code: jsCode };
        console.log(['getShareRecordUuid form: ', params]);
        api.post('weapp-coupon/get-share-record-uuid', params, false).then(res => {
            console.log(['getShareRecordUuid response: ', res]);
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
    initData(params) {
        const wxUserInfo = wx.getStorageSync('wxUserInfo');
        this.setData({
            'shareForm.merchant_id': params.merchant_id,
            'shareForm.store_id': params.store_id,
            'shareForm.related_id': params.related_id,
            'shareForm.related_type': params.related_type,
            'shareForm.give_num': params.give_num,
            'shareForm.send_mode': params.send_mode,
            'shareForm.staff_id': !params.staff_id ? 0 : params.staff_id,
            'shareForm.is_gather': params.is_gather,
            'shareForm.sender_id': !params.sender_id ? 0 : params.sender_id,
            'shareForm.sender_customer_id': !params.sender_customer_id ? 0 : params.sender_customer_id,
            'shareForm.send_record_id': !params.send_record_id ? 0 : params.send_record_id,
            'shareForm.sender_nick_name': !params.sender_nick_name ? '' : params.sender_nick_name,
            'shareForm.is_send': params.is_send,
            'shareForm.has_send_record': params.has_send_record,
            'shareForm.is_user_coupon': !params.is_user_coupon ? 2 : params.is_user_coupon,
            'shareForm.share_uuid': !params.share_uuid ? '' : params.share_uuid,
            hasAuth: !!wxUserInfo,
            sharable: params.sharable == 1 ? true : false
        });
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
        this.getDetail();
        //发送
        if (params.is_send == 1 && params.has_send_record == 2) {
            this.addSendRecord();
        }
        //分享
        if (params.is_send == 2) {
            this.wxLogin();
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(['share-detail.options', options]);
        let params = null;
        if (options.q) {
            params = getUrlArgs(decodeURIComponent(options.q));
        } else if (options.params) {
            params = JSON.parse(options.params);
        } else {
            params = options;
        }
        console.log(['share-detail.params', params]);
        this.initData(params);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(res) {
        if (res.from === 'button') {
            const wxUserInfo = wx.getStorageSync('wxUserInfo');
            const nickName = !wxUserInfo ? '' : wxUserInfo.nickName;
            const sharedUrl =
                '/pages/my-coupon/share-detail?merchant_id=' +
                this.data.shareForm.merchant_id +
                '&store_id=' +
                this.data.shareForm.store_id +
                '&related_id=' +
                this.data.shareForm.related_id +
                '&related_type=' +
                this.data.shareForm.related_type +
                '&staff_id=' +
                this.data.shareForm.staff_id +
                '&sender_id=' +
                this.data.shareForm.sender_id +
                '&send_record_id=' +
                this.data.shareForm.send_record_id +
                '&sender_nick_name=' +
                nickName +
                '&give_num=' +
                this.data.shareForm.give_num +
                '&is_gather=' +
                this.data.shareForm.is_gather +
                '&share_uuid=' +
                shareUuid +
                '&is_send=2' +
                '&send_mode=6' +
                '&is_user_coupon=2' +
                '&has_send_record=1' +
                '&sharable=1';

            this.addShareRecord(nickName);
            return {
                title: this.data.coupon.share_title,
                path: sharedUrl,
                imageUrl: this.data.coupon.share_img_url
            };
        }
    }
});
