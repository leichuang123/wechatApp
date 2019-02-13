import api from '../../../utils/api';
import { formatTime, showLoading } from '../../../utils/util';
Page({
    data: {
        cardInfo: {},
        form: {
            cardNumber: '',
            cardType: 2 //2储值卡,3计次卡
        }
    },
    /**
     * 获取会员卡详情
     */
    getCardInfo: function() {
        showLoading();
        api.get('weapp/membercarddetail', this.data.form).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({
                    cardInfo: res.data
                });
            }
        });
    },

    /**
     * 跳转到计次记录页面
     */
    gotoCountRecord: function(e) {
        let params = JSON.stringify({
            cardNumber: this.data.cardInfo.card_number,
            carNumber: this.data.cardInfo.car_number
        });
        wx.navigateTo({
            url: '/pages/count-record/count-record?cardData=' + params
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            'form.cardType': options.type,
            'form.cardNumber': options.cardNumber
        });
        this.getCardInfo();
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(res) {
       
    }
});
