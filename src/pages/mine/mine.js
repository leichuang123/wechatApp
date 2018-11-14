import { get } from '../../utils/api';
const app = getApp();
Page({
    data: {
        hasUserInfo: false,
        userInfo: {
            nickName: '',
            avatar: '',
            mobile: '',
            integral: 0 //用户积分,
        }
    },
    /**
     * 获取平台用户信息
     */
    getPlatformUserInfo: function() {
        get('weapp/indexinfo', {}, false, true).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    'userInfo.mobile': res.data.user_data.mobile,
                    'userInfo.integral': res.data.user_data.integral,
                    hasUserInfo: res.data.registered
                });
                wx.setStorageSync('sessionKey', res.data.sessionKey);
                wx.setStorageSync('userData', res.data);
                return;
            }
            this.setData({
                hasUserInfo: false
            });
        });
    },
    //获取用户信息
    onGetUserInfo: function(e) {
        let data = e.detail;
        if (data.errMsg === 'getUserInfo:ok') {
            app.setWxUserCache(data);
            wx.redirectTo({
                url: '/pages/register/register'
            });
        }
    },
    initData: function() {
        let userData = wx.getStorageSync('userData');
        if (!userData) {
            this.getPlatformUserInfo();
        } else {
            this.setData({
                'userInfo.mobile': userData.mobile,
                'userInfo.integral': userData.integral,
                hasUserInfo: userData.registered
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
