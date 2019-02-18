import { get } from '../../utils/api';
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
    initData: function() {
        const userData = wx.getStorageSync('userData');
        if (!userData) {
            this.getPlatformUserInfo();
        } else {
            this.setData({
                userInfo: userData,
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