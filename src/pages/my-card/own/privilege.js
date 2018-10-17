import { getRequest } from '../../../utils/api';
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        description: ''
    },
    /**
     * 获取会员卡特权说明
     */
    getCardDescription: function(cardNumber) {
        getRequest('weapp/getcarddescription', { card_number: cardNumber }).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    description: res.data.description,
                    loadingVisible: false,
                    hasData: true
                });
                return;
            }
            this.setData({
                loadingVisible: false,
                hasData: false
            });
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getCardDescription(options.card_number);
    }
});
