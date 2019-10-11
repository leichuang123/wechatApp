import { get } from '../../utils/api';
const app = getApp();
const sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        loadMoreVisible: false,
        hasMore: true,
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        sliderWidth: sliderWidth,
        tabs: ['最近三个月', '最近六个月', '最近一年'],
        records: [],
        carNumber: '',
        form: {
            cardNumber: '',
            timeField: 'oneMonth',
            cardType: 'times',
            page: 1
        }
    },
    /**
     * 切换tab
     */
    tabClick: function(e) {
        if (index == this.data.activeIndex) {
            return;
        }
        let index = e.currentTarget.id;
        this.setData({
            activeIndex: index,
            'form.timeField': index == 0 ? 'oneMonth' : index == 1 ? 'threeMonth' : 'sixMonth',
            'form.page': 1,
            records: [],
            loadingVisible: true,
            hasMore: true,
            hasData: true,
            sliderOffset: e.currentTarget.offsetLeft
        });
        this.getRecords();
    },
    /**
     * 获取计次记录
     */
    getRecords: function() {
        get('weapp/membercardtimescount', this.data.form).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    records: this.data.records.concat(res.data.data)
                });
            }
            let hasMore = res.errcode !== 0 || this.data.form.page >= res.data.last_page ? false : true;
            this.setData({
                loadMoreVisible: false,
                loadingVisible: false,
                hasMore: hasMore,
                hasData: this.data.records.length === 0 ? false : true
            });
        });
    },
    /**
     * 跳转到评价页面
     */
    gotoEvaluate: function(e) {
        let item = e.target.dataset.item,
            params = JSON.stringify({
                merchant_id: item.merchant_id,
                store_id: item.store_id,
                id: item.id,
                category: 2, //记次记录属于清洗开单
                order_number: item.order_number
            });
        wx.navigateTo({
            url: '/pages/evaluation/evaluation?params=' + params
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let cardData = JSON.parse(options.cardData);
        const mobile = wx.getStorageSync('systemInfo').windowWidth;
        this.setData({
            carNumber: cardData.carNumber,
            'form.cardNumber': cardData.cardNumber,
            sliderWidth: mobile / 3,
            sliderLeft: (app.globalData.windowWidth / this.data.tabs.length - this.data.sliderWidth) / 2,
            sliderOffset: (app.globalData.windowWidth / this.data.tabs.length) * this.data.activeIndex
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.setData({
            records: [],
            'form.page': 1,
            hasData: true,
            hasMore: true
        });
        this.getRecords();
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.setData({
            loadingVisible: true,
            hasData: true,
            hasMore: true,
            records: [],
            'form.page': 1
        });
        this.getRecords();
    },
    /**
     * 下拉加载更多
     */
    onReachBottom: function() {
        if (!this.data.hasMore) {
            return;
        }
        this.setData({
            loadMoreVisible: true,
            'form.page': this.data.form.page + 1
        });
        this.getRecords();
    }
});
