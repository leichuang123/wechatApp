import api from '../../utils/api';
import { makePhoneCall, openLocation } from '../../utils/wx-api';
Page({
    data: {
        loading: false,
        coupon: {},
        shareForm: {
            sender_nick_name: '',
            merchant_id: 0,
            store_id: 0,
            related_id: 0,
            related_type: 0,
            sender_id: 0,
            sender_customer_id: 0,
            send_record_id: 0,
            share_uuid: '',
            is_gather: 0
        },
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
    addShareRecord: function() {
        const wxUserInfo = wx.getStorageSync('wxUserInfo');
        this.setData({
            'shareForm.merchant_id': this.data.coupon.merchant_id,
            'shareForm.store_id': this.data.coupon.store_id,
            'shareForm.related_id': this.data.coupon.related_id,
            'shareForm.related_type': this.data.coupon.related_type,
            'shareForm.sender_customer_id': this.data.coupon.customer_id,
            'shareForm.sender_id': this.data.coupon.user_id,
            'shareForm.sender_nick_name': !!wxUserInfo ? wxUserInfo.nickName : '',
            'shareForm.give_num': 1,
            'shareForm.share_uuid': this.data.coupon.share_uuid,
            'shareForm.is_gather': this.data.coupon.is_gather,
            'shareForm.send_mode': 6 //分享转赠
        });
        api.postRequest('weapp-coupon/add-share-record', this.data.shareForm, false).then(res => {
            console.log(res.errmsg);
        });
    },
    /**
     * 获取分享记录唯一标识符
     */
    getShareRecordUuid: function() {
        this.setData({
            'shareForm.send_record_id': this.data.coupon.send_record_id
        });
        api.postRequest('weapp-coupon/get-share-record-uuid', this.data.shareForm, false).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    'shareForm.share_uuid': res.data
                });
            }
        });
    },
    call: function(e) {
        let tel = e.currentTarget.dataset.tel;
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
        let params = {
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
            let wxUserInfo = wx.getStorageSync('wxUserInfo');
            let nickName = !wxUserInfo ? '' : wxUserInfo.nickName;
            let sharedUrl =
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
                '&is_send=2' + //1:发送，2:分享
                '&is_user_coupon=1' + //1:是，2：否
                '&has_send_record=1' + //1:有，2：无
                '&send_mode=6'; //分享转赠
            this.addShareRecord();
            return {
                title: this.data.coupon.share_title,
                path: sharedUrl,
                imageUrl: this.data.coupon.share_img_url
            };
        }
    }
});
