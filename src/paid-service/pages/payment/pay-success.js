Page({
    data: {
        postVisible: false,
        form: {
            type: 2,
            id: '',
            money: 0
        }
    },
    /**
     * 跳转到首页
     */
    gotoIndex: function() {
        wx.switchTab({
            url: '../../../pages/index/index',
        })
    },
    /**
     * 查看已付款订单
     */
    gotoOrderDetail: function() {
        let parmas = JSON.stringify(this.data.form);
        wx.navigateTo({
            url: '../../../pages/order-list/detail?params=' + parmas,
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let params = JSON.parse(options.params);
        this.setData({
            'form.id': params.id,
            'form.money': params.money
        })
    }
})