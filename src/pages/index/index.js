import api from '../../utils/api';
import { toastMsg, confirmMsg } from '../../utils/util';
import { login, scanCode, getLocation } from '../../utils/wx-api';
const app = getApp();
Page({
    data: {
        city: '',
        indexInfo: {},
        form: {
            js_code: ''
        },
        bindForm: {
            user_id: 0,
            store_id: 0,
            car_number: [],
            mobile: ''
        }
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
                const userData = wx.getStorageSync('userData');
                this.setData({
                    'bindForm.car_number': this.data.IndexInfo.user_data.car,
                    'bindForm.mobile': this.data.IndexInfo.user_data.mobile,
                    'bindForm.store_id': storeData.store_id,
                    'bindForm.user_id': userData.user_data.id
                });
                api.postRequest('weapp/bind', this.data.bindForm)
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
                                wx.navigateTo({
                                    url: '/pages/store-list/detail?storeData=' + params
                                });
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
        let userData = wx.getStorageSync('userData');
        if (!userData || !userData.isRegist) {
            this.remindRegister();
        } else {
            this.bindStore();
        }
    },
    /**
     * 获取首页信息
     */
    getIndexInfo: function(withSessionKey) {
        api.getRequest('weapp/indexinfo', this.data.form, false, withSessionKey).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    IndexInfo: res.data
                });
                wx.setStorageSync('sessionKey', res.data.sessionKey);
                wx.setStorageSync('userData', res.data);
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
                api.getRequest('weapp/getcityinfo', locationInfo, false).then(res => {
                    if (res.errcode === 0) {
                        locationInfo.code = res.data.ad_info.adcode;
                        wx.setStorageSync('locationInfo', locationInfo);
                        let city = wx.getStorageSync('city');
                        let locatedCity = res.data.ad_info.city;
                        if (!city && city !== locatedCity) {
                            let content = '您当前的位置为' + locatedCity + '，是否切换到当前城市';
                            confirmMsg('', content, true);
                        }
                        this.setData({
                            city: locatedCity
                        });
                        wx.setStorageSync('city', locatedCity);
                    } else {
                        this.setData({
                            city: !city ? city : '请选择'
                        });
                        confirmMsg('', res.errmsg, false);
                    }
                });
            })
            .catch(() => {
                console.log('cancel');
                wx.setStorageSync('locationInfo', app.globalData.defaultLocation);
            });
    },
    wxLogin: function() {
        login()
            .then(res => {
                if (res.code) {
                    this.setData({
                        'form.js_code': res.code
                    });
                    this.getIndexInfo(false);
                } else {
                    this.getIndexInfo(true);
                    console.log('获取用户登录态失败：' + res.errMsg);
                }
            })
            .catch(() => {
                this.getIndexInfo(true);
                console.log('获取用户登录态失败：' + res.errMsg);
            });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getLocation();
    },
    onShow: function() {
        this.wxLogin();

        let city = wx.getStorageSync('city');
        this.setData({
            city: !city ? '请选择' : city
        });
        if (this.data.city.length > 4) {
            this.setData({
                city: this.data.city.substring(0, 3) + '...'
            });
        }
    }
});
