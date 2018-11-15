Page({
    data: {
        money: 0,
        account: ''
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
        const params = JSON.parse(options.params);
        this.setData({
            money: params.money,
            account: params.account
        });
    }
});
