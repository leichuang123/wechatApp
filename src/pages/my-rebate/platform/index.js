import { getRequest } from '../../../utils/api';
Page({
    data: {
        brokerage: '0.00',
        balance: '0.00'
    },
    /**
     * 获取用余额和户累计获得佣金
     */
    getBalanceWithAccumulatedBrokerage: function () {
        wx.showLoading({ title: '加载中...' });
        getRequest('weapp/balance-with-brokerage').then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({ brokerage: res.data.accumulated_brokerage, balance: res.data.balance});
                return;
            }
        });
    },
    /**
     * 跳转到我的页面
     */
    gotoMine: function () {
        wx.switchTab({
            url: '/pages/mine/mine',
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getBalanceWithAccumulatedBrokerage();
    }
})