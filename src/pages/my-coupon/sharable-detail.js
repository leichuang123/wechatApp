import api from '../../utils/api';
import { makePhoneCall, openLocation } from '../../utils/wx-api';
Page({
    data: {
        loading: false,
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
        this.setData({
            loading: true
        });
        api.getRequest('weapp-coupon/get-sharable-detail', this.data.form).then(res => {
            this.setData({
                loading: false
            });
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
            sende_record_id: this.data.coupon.sende_record_id,
            sender_nick_name: nickName,
            share_uuid: this.data.coupon.share_uuid,
            is_gather: this.data.coupon.is_gather
        };
        api.postRequest('weapp-coupon/add-share-record', params, false).then(res => {
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

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            form: {
                id: options.id,
                type: options.type
            }
        });
        this.getCouponInfo();
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
                this.data.coupon.merchant_id +
                '&store_id=' +
                this.data.coupon.store_id +
                '&related_id=' +
                this.data.coupon.related_id +
                '&related_type=' +
                this.data.coupon.related_type +
                '&sender_id=' +
                this.data.coupon.user_id +
                '&send_record_id=' +
                this.data.coupon.send_record_id +
                '&sender_customer_id=' +
                this.data.coupon.customer_id +
                '&sender_nick_name=' +
                nickName +
                '&give_num=1' +
                '&is_gather=' +
                this.data.coupon.is_gather +
                '&share_uuid=' +
                this.data.coupon.share_uuid +
                '&is_send=2' +
                '&is_user_coupon=1' +
                '&has_send_record=1' +
                '&send_mode=6';
            this.addShareRecord(nickName);
            return {
                title: this.data.coupon.share_title,
                path: sharedUrl,
                imageUrl: this.data.coupon.share_img_url
            };
        }
    }
});
