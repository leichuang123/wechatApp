import api from '../../../utils/api';
import { formatTime } from '../../../utils/util';
Page({
    data: {
        loading: true,
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
        api.get('weapp/membercarddetail', this.data.form).then(res => {
            this.setData({
                loading: false
            });
            if (res.errcode === 0) {
                this.setData({
                    cardInfo: res.data
                });
            }
        });
    },
    /**
     * 创建分享信息
     */
    createShareInfo: function(params) {
        api.post('weapp/createshareinfo', params).then(res => {
            console.log(res.errmsg);
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
        if (res.from === 'button') {
            let service = res.target.dataset.item;
            let time = formatTime(new Date());
            let userData = wx.getStorageSync('userData');
            let userId = !!userData ? userData.id : 0;
            let sharedUrl =
                '/pages/my-card/own/get-coupon?create_time=' +
                time +
                '&serviceName=' +
                service.service_name +
                '&storeName=' +
                this.data.cardInfo.store_name +
                '&recommendType=4' +
                '&recommendId=' +
                userId;
            let params = {
                url: sharedUrl,
                card_number: this.data.cardInfo.card_number,
                service_id: service.service_id
            };
            this.createShareInfo(params);
            return {
                title: '伙伴养车优惠券分享',
                path: sharedUrl
            };
        }
    }
});
