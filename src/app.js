import api from 'utils/api';
import { login, getSystemInfo, getLocation } from 'utils/wx-api';
App({
    globalData: {
        hasAuth: false,
        city: '',
        windowHeight: 0,
        windowWidth: 0,
        //默认经纬度为武汉经纬度
        defaultLocation: {
            latitude: 30.5287,
            longitude: 114.371399,
            city_code: '420100',
            city: '武汉市'
        },
        sessionKey: '',
        extConfig: {},
    },
    //设置用户缓存
    doLogin(jsCode) {
        const params = {
            js_code: jsCode,
            auth_type: this.globalData.extConfig.auth_type || 1,
            auth_related_id: this.globalData.extConfig.auth_related_id || 1,
            weapp_config_id: this.globalData.extConfig.weapp_config_id || 10,
        };
        api.get('weapp/login', params, false).then(res => {
            if (res.errcode === 0) {
                const sessionKey = res.data;
                wx.setStorageSync('sessionKey', sessionKey);
                this.globalData.sessionKey = sessionKey;
                if (this.doLoginCallBack) {
                    this.doLoginCallBack(res.data);
                }
            }
        });
    },
    /**
     * 本地存储微信用户信息
     */
    setWxUserCache: function(data) {
        let wxUserInfo = data.userInfo;
        wxUserInfo.encryptedData = data.encryptedData;
        wxUserInfo.iv = data.iv;
        wx.setStorageSync('wxUserInfo', wxUserInfo);
        this.globalData.hasAuth = true;
    },
    /**
     * 获取经纬度
     */
    getLocation: function(cb) {
        getLocation({
                type: 'wgs84'
            })
            .then(data => {
                if (typeof cb === 'function') {
                    cb(data);
                }
            })
            .catch(data => {
                if (typeof cb === 'function') {
                    cb(this.globalData.defaultLocation);
                }
            });
    },
    onLogin: function() {
        login()
            .then(res => {
                if (res.code) {
                    this.doLogin(res.code);
                } else {
                    console.log('获取用户登录态失败：' + res.errMsg);
                }
            })
            .catch(() => {
                console.log('获取用户登录态失败：' + res.errMsg);
            });
    },
    onLaunch: function() {
        getSystemInfo().then(res => {
            this.globalData.windowHeight = res.windowHeight + 48;
            this.globalData.windowWidth = res.windowWidth;
        });
        const wxUserInfo = wx.getStorageSync('wxUserInfo');
        this.globalData.hasAuth = !!wxUserInfo;

        this.globalData.extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
        this.onLogin();
    },
    onShow: function() {}
});