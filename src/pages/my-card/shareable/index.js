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
     * 获取会员卡列表
     */
    getCards: function() {
        get('/weapp/get-card-list').then(res => {
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
    tabClick: function(e) {
        if (e.currentTarget.id == 0) {
            wx.redirectTo({
                url: '/pages/my-card/own/index'
            });
        }
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
        try {
            var value = wx.getStorageSync('systemInfo');
            if (value) {
                this.setData({
                    sliderWidth: value.screenWidth / 2,
                    sliderOffset: value.screenWidth / 2
                });
            }
        } catch (e) {}
        this.getCards();
    }
});
