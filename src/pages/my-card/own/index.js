import { get } from '../../../utils/api';
const sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        cards: [],
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        sliderWidth: sliderWidth,
        tabs: ['我的会员卡', '可转赠会员卡']
    },
    /**
     * 获取我的会员卡
     */
    getCards: function() {
        get('weapp/membercardlist').then(res => {
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
    //查看储值卡记录
    gotoValue: function(e) {
        const id = e.currentTarget.id;
        wx.navigateTo({
            url: '/pages/stored-value-record/stored-value-record?' + 'cardNumber=' + id + '&month=' + 'oneMonth'
        });
    },
    //查看计次记录
    gotoCountRecord: function(e) {
        let params = JSON.stringify({
            cardNumber: e.currentTarget.dataset.item
        });
        wx.navigateTo({
            url: '/pages/count-record/count-record?cardData=' + params
        });
    },
    //查看详情
    gotoDetail: function(e) {
        wx.navigateTo({
            url:
                '/pages/my-card/own/detail?cardNumber=' +
                e.currentTarget.dataset.item.card_number +
                '&type=' +
                e.currentTarget.dataset.item.card_type
        });
    },
    tabClick: function(e) {
        if (e.currentTarget.id == 1) {
            wx.redirectTo({
                url: '/pages/my-card/shareable/index'
            });
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        try {
            var value = wx.getStorageSync('systemInfo');
            if (value) {
                this.setData({
                    sliderWidth: value.screenWidth / 2
                });
            }
        } catch (e) {}
        this.getCards();
    }
});
