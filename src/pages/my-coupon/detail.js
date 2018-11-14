import api from '../../utils/api';
import { makePhoneCall, openLocation, getSystemInfo } from '../../utils/wx-api';
const app = getApp();
Page({
    data: {
        loading: false,
        couponWidth: '',
        coupon: {}
    },
    /**
     * 获取优惠券详情
     */
    getCouponInfo: function(id) {
        this.setData({
            loading: true
        });
        api.get('weapp-coupon/get-detail', {
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
        getSystemInfo()
            .then(res => {
                this.setData({
                    couponWidth: res.windowWidth - 30 + 'px',
                    height: res.windowHeight + 'px'
                });
            })
            .catch(() => {
                this.setData({
                    couponWidth: app.globalData.windowWidth - 30 + 'px',
                    height: app.globalData.windowHeight + 48 + 'px'
                });
            });
        this.getCouponInfo(options.id);
    }
});
