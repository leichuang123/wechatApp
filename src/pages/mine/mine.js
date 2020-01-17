import { get } from '../../utils/api';
import api from '../../utils/api';
import { toastMsg, confirmMsg, showLoading } from '../../utils/util';
import { scanCode, getLocation, getSystemInfo } from '../../utils/wx-api';
const app = getApp();
Page({
    data: {
        userInfo: null,
        bmsWeappStoreInfo: {}
    },
    /**
     * 获取平台用户信息
     */
    getPlatformUserInfo: function() {
        get('weapp/get-user-info', {}, false).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    userInfo: res.data
                });
                wx.setStorageSync('userData', res.data);
            }
        });
    },
    //获取用户信息
    onGetUserInfo: function(e) {
        if (e.detail.errMsg !== 'getUserInfo:ok') {
            return;
        }
        app.setWxUserCache(e.detail);
        wx.redirectTo({ url: '/pages/register/register' });
    },
    /**
     * 绑定门店时验证是否注册
     */
    onBindStore: function() {
        const userData = wx.getStorageSync('userData');
        if (!userData || !userData.registered) {
            this.remindRegister();
        } else {
            this.bindStore(userData);
        }
    },
    /**
     * 绑定门店
     */
    bindStore: function(userData) {
        scanCode()
            .then(res => {
                const storeData = JSON.parse(res.result);
                const bindParams = {
                    store_id: storeData.store_id,
                    car_number: userData.car,
                    mobile: userData.mobile,
                    user_id: userData.id
                };
                api.post('weapp/bind', bindParams).then(res => {
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
                });
            })
            .catch(res => {
                console.log('扫码失败:', res);
            });
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
    initData: function() {
        const userData = wx.getStorageSync('userData');
        if (!userData) {
            this.getPlatformUserInfo();
        } else {
            this.setData({
                userInfo: userData
            });
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.initData();
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        if (!bmsWeappStoreInfo) {
            this.getLocation();
            return;
        }
        this.setData({
            bmsWeappStoreInfo: bmsWeappStoreInfo
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
                this.getLocationInfo(locationInfo);
            })
            .catch(res => {
                let me = this;
                wx.showModal({
                    content: '请您开启手机GPS定位',
                    confirmText: '我已开启',
                    confirmColor: '#e60103',
                    success(res) {
                        if (res.confirm) {
                            wx.reLaunch({
                                url: '/pages/mine/mine'
                            });
                        } else if (res.cancel) {
                            me.getLocationInfo();
                        }
                    }
                });
            });
    },
    getLocationInfo: function(locationInfo) {
        showLoading();
        api.get('weapp/getcityinfo', locationInfo, false).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                if (locationInfo) {
                    const selectedCity = wx.getStorageSync('selectedCity');
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
                    locationInfo.adcode = res.data.ad_info.adcode;
                    locationInfo.city_code = res.data.ad_info.city_code.substring(res.data.ad_info.nation_code.length);
                    locationInfo.city = res.data.ad_info.city;
                    locationInfo.district = res.data.ad_info.district;
                    wx.setStorageSync('locationInfo', locationInfo);
                }
                //储存定位获取的最近的门店信息
                let bmsWeappStoreInfo = res.data.store_info;
                this.setData({
                    bmsWeappStoreInfo: bmsWeappStoreInfo.merchant_id
                });
                wx.setStorageSync('bmsWeappStoreInfo', bmsWeappStoreInfo);
                this.getType();
                this.getRecommend();
                this.getGoodList(true);
            } else {
                confirmMsg('', res.errmsg, false, () => {
                    wx.reLaunch({
                        url: '/pages/index/index'
                    });
                });
            }
        });
    }
});
