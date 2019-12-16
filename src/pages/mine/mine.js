import { get } from '../../utils/api';
import api from '../../utils/api';
import { toastMsg, confirmMsg, showLoading } from '../../utils/util';
import { scanCode, getLocation, getSystemInfo } from '../../utils/wx-api';
const app = getApp();
Page({
    data: {
        userInfo: null
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
    }
});
