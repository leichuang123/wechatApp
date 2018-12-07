import api from '../../utils/api';
import { toastMsg, confirmMsg } from '../../utils/util';
import { scanCode, getLocation } from '../../utils/wx-api';
const app = getApp();
Page({
    data: {
        couponDialogVisible: false,
        city: '',
        userData: null,
        queues: [],
        reservations: [],
        unreceivedCoupons: []
    },
    /**
     * 注册提醒
     */
    remindRegister: function() {
        confirmMsg('亲', '您还没有注册呢，先注册一下吧', true, () => {
            wx.navigateTo({
                url: '/pages/register/register'
            });
        });
    },
    /**
     * 绑定门店
     */
    bindStore: function() {
        scanCode()
            .then(res => {
                const storeData = JSON.parse(res.result);
                const bindParams = {
                    store_id: storeData.store_id,
                    car_number: this.data.userData.car,
                    mobile: this.data.userData.mobile,
                    user_id: this.data.userData.id
                };
                api.post('weapp/bind', bindParams)
                    .then(res => {
                        if (res.errcode === 0) {
                            const locationInfo = wx.getStorageSync('locationInfo');
                            const locationData = !locationInfo ? app.globalData.defaultLocation : locationInfo;
                            const params = JSON.stringify({
                                storeId: storeData.store_id,
                                merchantId: storeData.merchant_id,
                                latitude: locationData.latitude,
                                longitude: locationData.longitude,
                                fromPage: 'wash'
                            });
                            toastMsg('绑定成功', 'success', 1000, () => {
                                wx.navigateTo({ url: '/pages/store-list/detail?storeData=' + params });
                            });
                            return;
                        }
                        confirmMsg('', res.errmsg, false);
                    })
                    .catch(res => {
                        console.log(res);
                    });
            })
            .catch(() => {
                console.log('扫码失败');
            });
    },
    /**
     * 绑定门店时验证是否注册
     */
    onBindStore: function() {
        const userData = wx.getStorageSync('userData');
        if (!userData || !userData.registered) {
            this.remindRegister();
        } else {
            this.bindStore();
        }
    },
    /**
     * 获取首页信息
     */
    getIndexInfo: function() {
        api.get('weapp/indexinfo', {}, false).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    userData: res.data.userData,
                    queues: !res.data.queues ? [] : res.data.queues,
                    reservations: !res.data.reservations ? [] : res.data.reservations,
                    unreceivedCoupons: !res.data.unreceivedCoupons ? [] : res.data.unreceivedCoupons.data,
                    couponDialogVisible: !!res.data.unreceivedCoupons && res.data.unreceivedCoupons.data.length > 0
                });
                wx.setStorageSync('sessionKey', res.data.sessionKey);
                wx.setStorageSync('userData', res.data.userData);
            } else if (res.errcode === 999) {
                console.log(res.errmsg);
            } else {
                confirmMsg('提示', res.errmsg, false);
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
                        locationInfo.city_code = res.data.ad_info.city_code.substring(res.data.ad_info.nation_code.length);
                        locationInfo.city = res.data.ad_info.city;
                        locationInfo.district = res.data.ad_info.district
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
            userData: null,
            queues: [],
            reservations: [],
            unreceivedCoupons: []
        });
        if (!app.globalData.sessionKey) {
            app.doLoginCallBack = res => {
                wx.setStorageSync('sessionKey', res.sessionKey);
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
    onLoad: function() {
        this.getLocation();
    },
    onShow: function() {
        this.initData();
    }
});