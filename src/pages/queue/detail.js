Page({
    data: {
        queueInfo: {}
    },
    /**
     * 返回到门店详情页
     */
    gotoStoreDetail: function() {
        wx.navigateBack({
            delta: 3
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            queueInfo: JSON.parse(options.queueData)
        });
    }
});
