import api from '../../utils/api';
import { confirmMsg, getUrlArgs } from '../../utils/util';
import { makePhoneCall, openLocation } from '../../utils/wx-api';
const app = getApp();
Page({
    data: {
        loading: false,
        hasExpired: false,
        hasAuth: false,
        form: {
            related_id: 0,
            related_type: 0
        },
        expireForm: {
            related_id: 0,
            related_type: 0,
            send_record_id: 0,
            share_uuid: '',
            is_send: 0
        },
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
            is_gather: 2, //不是
            sender_nick_name: ''
        },
        sendForm: {
            merchant_id: 0,
            store_id: 0,
            related_id: 0,
            related_type: 0,
            send_mode: 0,
            give_num: 0,
            staff_id: 0,
            is_gather: 2, //不是
            customer_id: 0
        },
        coupon: {}
    },

    /**
     * 检查页面是否过期
     */
    hasExpired: function() {
        this.setData({
            'expireForm.send_record_id': this.data.shareForm.send_record_id,
            'expireForm.share_uuid': !this.data.shareForm.share_uuid ? 0 : this.data.shareForm.share_uuid,
            'expireForm.related_id': this.data.shareForm.related_id,
            'expireForm.related_type': this.data.shareForm.related_type,
            'expireForm.is_send': this.data.shareForm.is_send
        });
        api.getRequest('weapp-coupon/has-expired', this.data.expireForm, false).then(res => {
            console.log('hasExpired response: ', res);
            this.setData({
                hasExpired: res.errcode === 0 ? res.data : true
            });
            if (!this.data.hasExpired) {
                this.setData({
                    'shareForm.coupon_name': this.data.coupon.name,
                    'shareForm.store_name': this.data.coupon.store_name
                });
                let params = JSON.stringify(this.data.shareForm);
                wx.navigateTo({
                    url: 'get-coupon?params=' + params
                });
            } else {
                wx.navigateTo({
                    url: 'share-expired'
                });
            }
        });
    },
    /**
     * 获取优惠券详情
     */
    getDetail: function() {
        console.log('getDetail form: ', this.data.form);
        this.setData({
            loading: true
        });
        api.getRequest('weapp-coupon/get-share-detail', this.data.form, false)
            .then(res => {
                console.log('getDetail response: ', res);
                this.setData({
                    loading: false
                });
                if (res.errcode === 0) {
                    this.setData({
                        coupon: res.data
                    });
                }
            })
            .catch(res => {
                console.log(res);
            });
    },
    /**
     * 添加发送记录
     */
    addSendRecord: function() {
        console.log('sendForm', this.data.sendForm);
        api.postRequest('weapp-coupon/add-send-record', this.data.sendForm, false).then(res => {
            console.log('addSendRecord response: ', res);
            if (res.errcode === 0) {
                this.setData({
                    'shareForm.send_record_id': res.data
                });
            }
        });
    },
    /**
     * 添加分享记录
     */
    addShareRecord: function() {
        console.log('addShareRecord form: ', this.data.shareForm);
        api.postRequest('weapp-coupon/add-share-record', this.data.shareForm, false).then(res => {
            console.log(res.errmsg);
        });
    },
    /**
     * 获取分享记录唯一标识符
     */
    getShareRecordUuid: function() {
        console.log('getShareRecordUuid form: ', this.data.shareForm);
        api.postRequest('weapp-coupon/get-share-record-uuid', this.data.shareForm, false).then(res => {
            console.log('getShareRecordUuid response: ', res);
            if (res.errcode) {
                this.setData({
                    'shareForm.share_uuid': res.data
                });
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
        let wxUserInfo = wx.getStorageSync('wxUserInfo');
        if (!wxUserInfo) {
            let data = e.detail;
            if (data.errMsg === 'getUserInfo:ok') {
                this.setData({
                    'shareForm.sender_nick_name': data.userInfo.nickName,
                    hasAuth: true
                });
                app.setWxUserCache(data);
            } else {
                confirmMsg('', '需要微信授权才能分享哦', false);
            }
        } else {
            this.setData({
                hasAuth: true
            });
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options);
        let params = null;
        if (options.q) {
            let url = decodeURIComponent(options.q);
            params = getUrlArgs(url);
        } else {
            params = options;
        }
        console.log(params);
        this.setData({
            shareForm: params,
            hasAuth: app.globalData.hasAuth,
            'form.related_id': params.related_id,
            'form.related_type': params.related_type,

            'sendForm.merchant_id': params.merchant_id,
            'sendForm.store_id': params.store_id,
            'sendForm.related_id': params.related_id,
            'sendForm.related_type': params.related_type,
            'sendForm.send_mode': params.send_mode,
            'sendForm.give_num': params.give_num,
            'sendForm.staff_id': !params.staff_id ? 0 : params.staff_id,
            'sendForm.is_gather': params.is_gather,
            'sendForm.customer_id': !params.customer_id ? 0 : params.customer_id
        });

        this.getDetail();
        //发送
        if (params.is_send == 1 && params.has_send_record == 2) {
            this.addSendRecord();
        }
        //分享
        if (params.is_send == 2) {
            this.getShareRecordUuid();
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(res) {
        if (res.from === 'button') {
            let staffId = !this.data.shareForm.staff_id ? 0 : this.data.shareForm.staff_id;
            let senderId = !this.data.shareForm.sender_id ? 0 : this.data.shareForm.sender_id;
            let wxUserInfo = wx.getStorageSync('wxUserInfo');
            let nickName = !wxUserInfo ? '' : wxUserInfo.nickName;
            let sharedUrl =
                '/pages/my-coupon/share-detail?merchant_id=' +
                this.data.form.merchant_id +
                '&store_id=' +
                this.data.form.store_id +
                '&related_id=' +
                this.data.form.related_id +
                '&related_type=' +
                this.data.form.related_type +
                '&staff_id=' +
                staffId +
                '&sender_id=' +
                senderId +
                '&send_record_id=' +
                this.data.shareForm.send_record_id +
                '&sender_nick_name=' +
                nickName +
                '&give_num=' +
                this.data.shareForm.give_num +
                '&is_gather=' +
                this.data.shareForm.is_gather +
                '&share_uuid=' +
                this.data.shareForm.share_uuid +
                '&is_send=2' + //1：发送，2：分享
                '&send_mode=6' + //分享转赠
                '&is_user_coupon=2' + //1:是，2：否
                '&has_send_record=1'; //1:有，2：无

            this.addShareRecord();
            return {
                title: this.data.coupon.share_title,
                path: sharedUrl,
                imageUrl: this.data.coupon.share_img_url
            };
        }
    }
});
