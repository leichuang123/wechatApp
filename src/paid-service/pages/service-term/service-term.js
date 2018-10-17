Page({
    data: {

    },
    /**
     * 返回到上一页
     */
    goBack: function () {
        wx.navigateBack({
            delta: 1
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    }
})