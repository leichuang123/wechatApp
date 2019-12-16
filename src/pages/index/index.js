import api from '../../utils/api';
import { toastMsg, confirmMsg, showLoading } from '../../utils/util';
import { scanCode, getLocation, getSystemInfo } from '../../utils/wx-api';
const app = getApp();
Page({
    data: {
        couponDialogVisible: false,
        city: '',
        queues: [],
        reservations: [],
        unreceivedCoupons: []
    },
    /**
     * 获取首页信息
     */
    getIndexInfo: function() {
        api.get('weapp/indexinfo', {}, false).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    queues: !res.data.queues ? [] : res.data.queues,
                    reservations: !res.data.reservations ? [] : res.data.reservations,
                    unreceivedCoupons: !res.data.unreceivedCoupons ? [] : res.data.unreceivedCoupons.data,
                    couponDialogVisible: !!res.data.unreceivedCoupons && res.data.unreceivedCoupons.data.length > 0
                });
                wx.setStorageSync('userData', res.data.userData);
            } else {
                console.log(res.errmsg);
            }
        });
    },
    /**
     * 定位
     */
    getLocation: function() {
        getLocation({
            type: 'wgs84'
        })
            .then(res => {
                let locationInfo = {
                    latitude: res.latitude,
                    longitude: res.longitude
                };
                api.get('weapp/getcityinfo', locationInfo, false).then(res => {
                    const selectedCity = wx.getStorageSync('selectedCity');
                    if (res.errcode === 0) {
                        locationInfo.adcode = res.data.ad_info.adcode;
                        locationInfo.city_code = res.data.ad_info.city_code.substring(
                            res.data.ad_info.nation_code.length
                        );
                        locationInfo.city = res.data.ad_info.city;
                        locationInfo.district = res.data.ad_info.district;
                        wx.setStorageSync('locationInfo', locationInfo);
                        const locatedCity = res.data.ad_info.city;
                        if (locatedCity !== selectedCity.name) {
                            const content = '您当前的位置为' + locatedCity + '，是否切换到当前城市';
                            confirmMsg(
                                '',
                                content,
                                true,
                                () => {
                                    this.setData({
                                        city: locatedCity
                                    });
                                    wx.setStorageSync('selectedCity', {
                                        name: locatedCity,
                                        code: locationInfo.city_code
                                    });
                                },
                                () => {
                                    this.setData({
                                        city: !selectedCity ? '请选择' : selectedCity.name
                                    });
                                }
                            );
                        }
                    } else {
                        this.setData({
                            city: !selectedCity ? '请选择' : selectedCity.name
                        });
                        confirmMsg('', res.errmsg, false);
                    }
                });
            })
            .catch(res => {
                wx.setStorageSync('locationInfo', app.globalData.defaultLocation);
            });
    },
    onGetCoupon: function(e) {
        const params = JSON.stringify(e.currentTarget.dataset.item);
        this.updateRemindCount();
        wx.navigateTo({
            url: '/pages/my-coupon/share-detail?params=' + params
        });
    },
    updateRemindCount: function() {
        const ids = this.getUnreceivedCouponSendDetailIds();
        api.post('/weapp-coupon/update-remind-count', { id: ids }).then(res => {
            if (res.errcode !== 0) {
                console.log(res.errmsg);
            }
        });
    },
    getUnreceivedCouponSendDetailIds: function() {
        return this.data.unreceivedCoupons.map(val => val.id);
    },
    /**
     * 关闭优惠券领取提醒框
     *
     * @param {event} e
     */
    closeCouponDialog: function(e) {
        this.setData({
            couponDialogVisible: false
        });
        this.updateRemindCount();
    },
    initData: function() {
        this.setData({
            couponDialogVisible: false,
            queues: [],
            reservations: [],
            unreceivedCoupons: []
        });
        if (!app.globalData.sessionKey) {
            app.doLoginCallBack = sessionKey => {
                wx.setStorageSync('sessionKey', sessionKey);
                this.getIndexInfo();
            };
        } else {
            this.getIndexInfo();
        }

        const selectedCity = wx.getStorageSync('selectedCity');
        this.setData({
            city: !selectedCity ? '请选择' : selectedCity.name
        });
        if (this.data.city.length > 4) {
            this.setData({
                city: this.data.city.substring(0, 3) + '...'
            });
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getLocation();
    },
    onShow: function() {
        this.initData();
    }
});
