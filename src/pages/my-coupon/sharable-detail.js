import api from '../../utils/api';
import { makePhoneCall, openLocation } from '../../utils/wx-api';
import { showLoading } from '../../utils/util';
const app = getApp();
Page({
    data: {
        loading: false,
        hasAuth: false,
        couponWidth: '',
        SEND_MODE_SHARE: 6,
        NOT_SEND: 2,
        IS_USER_COUPON: 1,
        HAS_SEND_RECORD: 1,
        SHARABLE: 2,
        coupon: {},
        form: {
            id: 0,
            type: 1
        }
    },
    /**
     * 获取优惠券详情
     */
    getCouponInfo: function() {
        showLoading();
        api.get('weapp-coupon/get-sharable-detail', this.data.form).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({
                    coupon: res.data
                });
            }
        });
    },
    /**
     * 添加分享记录
     */
    addShareRecord: function(nickName) {
        const params = {
            merchant_id: this.data.coupon.merchant_id,
            store_id: this.data.coupon.store_id,
            related_id: this.data.coupon.related_id,
            related_type: this.data.coupon.related_type,
            sender_customer_id: this.data.coupon.customer_id,
            sender_id: this.data.coupon.user_id,
            send_record_id: this.data.coupon.send_record_id,
            sender_nick_name: nickName,
            share_uuid: this.data.coupon.share_uuid,
            is_gather: this.data.coupon.is_gather
        };
        api.post('weapp-coupon/add-share-record', params, false).then(res => {
            console.log(['addShareRecord-response', res.errmsg]);
        });
    },
    call: function(e) {
        const tel = e.currentTarget.dataset.tel;
        makePhoneCall({
            phoneNumber: tel
        })
            .then(() => {
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
        const params = {
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
    initData(options) {
        this.setData({
            hasAuth: app.globalData.hasAuth,
            couponWidth: app.globalData.windowWidth - 30 + 'px',
            form: {
                id: options.id,
                type: options.type
            }
        });
        this.getCouponInfo();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.initData(options);
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(res) {
        if (res.from === 'button') {
            const wxUserInfo = wx.getStorageSync('wxUserInfo');
            const nickName = !wxUserInfo ? '' : wxUserInfo.nickName;
            const params = this.data.coupon;
            const sharedUrl =
                '/pages/my-coupon/share-detail?merchant_id=' +
                params.merchant_id +
                '&store_id=' +
                params.store_id +
                '&related_id=' +
                params.related_id +
                '&related_type=' +
                params.related_type +
                '&sender_id=' +
                params.user_id +
                '&send_record_id=' +
                params.send_record_id +
                '&sender_customer_id=' +
                params.customer_id +
                '&sender_nick_name=' +
                nickName +
                '&give_num=1' +
                '&is_gather=' +
                params.is_gather +
                '&share_uuid=' +
                params.share_uuid +
                '&is_send=' +
                this.data.NOT_SEND +
                '&is_user_coupon=' +
                this.data.IS_USER_COUPON +
                '&has_send_record=' +
                this.data.HAS_SEND_RECORD +
                '&send_mode=' +
                this.datra.SEND_MODE_SHARE +
                '&sharable=' +
                this.data.SHARABLE;
            this.addShareRecord(nickName);
            return { title: params.share_title, path: sharedUrl, imageUrl: params.share_img_url };
        }
    }
});
