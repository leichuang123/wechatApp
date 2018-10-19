import { getRequest } from '../../../utils/api';
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        cards: []
    },
    /**
     * 获取我的会员卡
     */
    getCards: function() {
        getRequest('weapp/membercardlist').then(res => {
            if (res.errcode === 0) {
                this.setData({
                    cards: res.data
                });
            }
            this.setData({
                loadingVisible: false,
                hasData: this.data.cards.length === 0 ? false : true
            });
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getCards();
    }
});
