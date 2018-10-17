Page({

    data: {

    },
    /**
         * 跳转到订单列表
         */
    gotoOrderDetail: function () {
        wx.navigateTo({
            url: '../../../pages/order-list/order-list?type=2',
        });
    },
    /**
     * 跳转到首页
     */
    gotoIndex: function () {
        wx.switchTab({
            url: '/pages/index/index',
        });
    }
})