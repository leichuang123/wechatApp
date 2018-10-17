Page({
    data: {
    },
    /**
     * 跳转到订单列表
     */
    gotoOrderDetail: function () {
        wx.navigateTo({
            url: '/pages/order-list/order-list?type=3',
        });
    },
    /**
     * 跳转到首页
     */
    gotoHomePage: function () {
        wx.switchTab({
            url: '/pages/index/index',
        });
    }
})