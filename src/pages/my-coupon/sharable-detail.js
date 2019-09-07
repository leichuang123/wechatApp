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
        SHARABLE: 1,
        coupon: {},
        form: {
            id: 0,
            type: 1,
            auth_type: 0,
            auth_related_id: 0
        }
    },
    /**
     * 获取优惠券详情
     */
    getCouponInfo: function() {
        showLoading();
        api.get('weapp-coupon/get-sharable-detail', this.data.form)
            .then(res => {
                wx.hideLoading();
                if (res.errcode === 0) {
                    this.setData({
                        coupon: res.data
                    });
                }
            })
            .catch(() => {
                wx.hideLoading();
            });
    },
    /**
     * 添加分享记录
     */
    addShareRecord: function() {
        const wxUserInfo = wx.getStorageSync('wxUserInfo');
        const nickName = !wxUserInfo ? '' : wxUserInfo.nickName;
        const coupon = Object.assign({}, this.data.coupon);
        const params = {
            merchant_id: coupon.merchant_id,
            store_id: coupon.store_id,
            related_id: coupon.related_id,
            related_type: coupon.related_type,
            sender_customer_id: coupon.customer_id,
            sender_id: coupon.user_id,
            send_record_id: coupon.send_record_id,
            share_uuid: coupon.share_uuid,
            is_gather: coupon.is_gather,
            sender_nick_name: nickName
        };
        api.post('weapp-coupon/add-share-record', params, false).then(res => {
            if (res.errcode == 0) {
                toastMsg(res.errmsg, 'success', 1000);
            }
            toastMsg(res.errmsg, 'error', 1000);
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
                type: options.type,
                auth_type: app.globalData.extConfig.auth_type || 1,
                auth_related_id: app.globalData.extConfig.auth_related_id || 1
            }
        });
        this.getCouponInfo();
    },
    generateShareUrl(params) {
        return (
            '/pages/my-coupon/share-detail?related_id=' +
            params.related_id +
            '&related_type=' +
            params.related_type +
            '&sender_id=' +
            params.user_id +
            '&send_record_id=' +
            params.send_record_id +
            '&give_num=1' +
            '&is_gather=' +
            params.is_gather +
            '&share_uuid=' +
            params.share_uuid +
            '&send_mode=' +
            this.data.SEND_MODE_SHARE
        );
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
            this.addShareRecord();

            const params = Object.assign({}, this.data.coupon);
            const sharedUrl = this.generateShareUrl(params);

            return { title: params.share_title, path: sharedUrl, imageUrl: params.share_img_url };
        }
    }
});
