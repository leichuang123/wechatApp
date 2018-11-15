Page({
    data: {
        reservationInfo: {}
    },
    /**
     * 返回到门店详情页
     */
    gotoStoreDetail: function() {
        wx.navigateBack({
            delta: 2
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({ reservationInfo: JSON.parse(options.reservationData) });
    }
});
