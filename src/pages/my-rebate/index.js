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
        showLoading();
        get('weapp/accumulated-income').then(res => {
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
            url: '/pages/mine/mine'
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getAccumulatedIncome();
    }
});
