import { get } from '../../utils/api';
import { showLoading } from '../../utils/util';
Page({
    data: {
        income: '0.00'
    },
    /**
     * 获取用户累计获得佣金
     */
    getAccumulatedIncome: function() {
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        let params = {
            merchant_id: bmsWeappStoreInfo.merchant_id
        };
        showLoading();
        get('weapp/accumulated-income', params).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({ income: res.data });
                return;
            }
        });
    },
    /**
     * 跳转到我的页面
     */
    gotoMine: function() {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getAccumulatedIncome();
    }
});
