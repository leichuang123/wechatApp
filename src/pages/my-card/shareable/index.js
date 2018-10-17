import { getRequest } from '../../../utils/api';
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        cards: []
    },
    /**
     * 获取会员卡列表
     */
    getCards: function() {
        getRequest('/weapp/get-card-list').then(res => {
            if (res.errcode === 0) {
                this.setData({
                    cards: res.data
                });
            }
            this.setData({
                loadingVisible: false,
                hasData: this.data.cards.length > 0 ? true : false
            });
        });
    },
    /**
     * 跳转到详情页
     */
    gotoDetail: function(e) {
        let item = e.currentTarget.dataset.item;
        let params = JSON.stringify({
            merchant_id: item.merchant_id,
            store_id: item.store_id,
            customer_card_id: item.customer_card_id
        });
        wx.navigateTo({
            url: 'detail?params=' + params
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getCards();
    }
});
