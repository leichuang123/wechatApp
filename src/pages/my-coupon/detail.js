import api from '../../utils/api';
import { makePhoneCall, openLocation, getSystemInfo } from '../../utils/wx-api';
import { showLoading } from '../../utils/util';
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
        showLoading();
        const positionInfo = wx.getStorageSync('locationInfo');
        const params = {
            id: id,
            latitude: positionInfo.latitude || '',
            longitude: positionInfo.longitude || ''
        };
        api.get('weapp-coupon/get-detail', params).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({
                    coupon: res.data
                });
            }
        });
    },
    call: function(e) {
        makePhoneCall({ phoneNumber: e.currentTarget.dataset.tel })
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
        openLocation({
            latitude: parseFloat(this.data.coupon.tencent_latitude),
            longitude: parseFloat(this.data.coupon.tencent_longitude),
            scale: 18,
            name: this.data.coupon.store_name,
            address: this.data.coupon.store_address
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const systemInfo = wx.getStorageSync('systemInfo');
        this.setData({
            couponWidth: systemInfo.windowWidth - 30 + 'px',
            height: systemInfo.windowHeight + 'px'
        });
        this.getCouponInfo(options.id);
    }
});
