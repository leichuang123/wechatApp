import api from '../../utils/api';
const app = getApp();
const sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        hasData: true,
        hasMore: true,
        loadMoreVisible: false,
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        sliderWidth: sliderWidth,
        coupons: [],
        tabs: ['待领取', '未使用', '已使用', '已过期'],
        form: {
            type: 0,
            page: 1
        }
    },
    /**
     * 获取优惠券列表
     */
    getCoupons: function() {
        api.get('weapp-coupon/get-list', this.data.form).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    coupons: this.data.coupons.concat(res.data.data)
                });
            }
            let hasMore = res.errcode !== 0 || this.data.form.page >= res.data.last_page ? false : true;
            this.setData({
                hasMore: hasMore,
                loadMoreVisible: false,
                loadingVisible: false,
                hasData: this.data.coupons.length === 0 ? false : true
            });
        });
    },
    /**
     * 切换tab
     */
    tabClick: function(e) {
        const index = e.currentTarget.id;
        if (index == this.data.activeIndex) {
            return;
        }
        this.setData({
            'form.type': index,
            activeIndex: index,
            loadingVisible: true,
            hasData: true,
            hasMore: true,
            coupons: [],
            sliderOffset: e.currentTarget.offsetLeft
        });
        this.getCoupons();
    },
    gotoDetail: function(e) {
        const item = e.currentTarget.dataset.item;
        if (this.data.form.type != 0) {
            wx.navigateTo({ url: 'detail?id=' + item.id });
        } else {
            const params = JSON.stringify(item);
            wx.navigateTo({
                url: '/pages/my-coupon/share-detail?params=' + params
            });
        }
    },
    initData: function() {
        this.getCoupons();
        this.setData({
            sliderLeft: (app.globalData.windowWidth / this.data.tabs.length - sliderWidth) / 2,
            sliderOffset: (app.globalData.windowWidth / this.data.tabs.length) * this.data.activeIndex
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.initData();
    },
    /**
     * 加载更多
     */
    onReachBottom: function() {
        if (!this.data.hasMore) {
            return;
        }
        this.setData({
            loadMoreVisible: true,
            'form.page': this.data.form.page + 1
        });
        this.getCoupons();
    }
});
