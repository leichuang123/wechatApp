import { get } from '../../../utils/api';
import { showLoading } from '../../../utils/util';
Page({
    data: {
        description: ''
    },
    /**
     * 获取会员卡特权说明
     */
    getCardDescription: function(cardNumber) {
        showLoading();
        get('weapp/getcarddescription', { card_number: cardNumber }).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({
                    description: res.data.description
                });
            }
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getCardDescription(options.card_number);
    }
});
