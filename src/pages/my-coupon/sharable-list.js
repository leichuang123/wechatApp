import api from '../../utils/api';
const app = getApp();
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
        sliderWidth: 0,
        coupons: [],
        tabs: ['可分享', '已分享', '已过期'],
        form: {
            user_id: 0,
            type: 1,
            page: 1
        }
    },
    /**
     * 获取优惠券列表
     */
    getCoupons: function() {
        api.get('weapp-coupon/get-sharable-list', this.data.form).then(res => {
            if (res.errcode === 0) {
                this.setData({ coupons: this.data.coupons.concat(res.data.data) });
            }
            let hasMore = !(res.errcode !== 0 || this.data.form.page >= res.data.last_page);
            this.setData({
                hasMore: hasMore,
                loadMoreVisible: false,
                loadingVisible: false,
                hasData: this.data.coupons.length > 0
            });
        });
    },
    /**
     * 切换tab
     */
    tabClick: function(e) {
        let index = e.currentTarget.dataset.index;
        if (index == this.data.activeIndex) {
            return;
        }
        this.setData({
            activeIndex: index,
            'form.type': index + 1,
            loadingVisible: true,
            hasData: true,
            hasMore: true,
            coupons: [],
            sliderOffset: e.currentTarget.offsetLeft
        });
        this.getCoupons();
    },
    /**
     * 跳转到详情页
     */
    gotoDetail: function(e) {
        if (this.data.form.type == 3) {
            return;
        }

        let id = e.currentTarget.id;
        wx.navigateTo({
            url: 'sharable-detail?id=' + id + '&type=' + this.data.form.type
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const mobile = wx.getStorageSync('systemInfo').windowWidth;
        let userData = wx.getStorageSync('userData');
        this.setData({
            sliderWidth: mobile / 4,
            'form.user_id': !!userData ? userData.id : 0,
            sliderLeft: (app.globalData.windowWidth / this.data.tabs.length - this.data.sliderWidth) / 2,
            sliderOffset: (app.globalData.windowWidth / this.data.tabs.length) * this.data.activeIndex
        });
        this.getCoupons();
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
