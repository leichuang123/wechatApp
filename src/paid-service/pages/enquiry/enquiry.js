Page({
    data: {
        show: false,
        form: {
            type: 1,
            id: ''
        }
    },
    /**
     * 跳转到首页
     */
    gotoIndex: function() {
        wx.switchTab({
            url: '../../../pages/index/index',
        });
    },
    /**
     * 查看已付款订单
     */
    gotoOrderDetail: function() {
        let params = JSON.stringify(this.data.form);
        wx.navigateTo({
            url: '../../../pages/order-list/detail?params=' + params,
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            'form.id': options.id
        });
    }
})