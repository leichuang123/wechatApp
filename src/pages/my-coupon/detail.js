import { getRequest } from '../../utils/api';
import { makePhoneCall, openLocation } from '../../utils/wx-api';
Page({
    data: {
        loading: false,
        coupon: {}
    },
    /**
     * 获取优惠券详情
     */
    getCouponInfo: function(id) {
        this.setData({
            loading: true
        });
        getRequest('weapp-coupon/get-detail', {
            id: id
        }).then(res => {
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
        this.getCouponInfo(options.id);
    }
});
