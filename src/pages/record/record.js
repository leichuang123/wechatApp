import api from '../../utils/api';
const app = getApp();
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        hasMore: true,
        loadMoreVisible: false,
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        sliderWidth: 0,
        recordType: '',
        records: [],
        tabs: ['最近三个月', '最近六个月', '最近一年'],
        form: {
            month: 3,
            page: 1
        }
    },
    /**
     * 切换tab
     */
    tabClick: function(e) {
        let index = e.currentTarget.id;
        if (index == this.data.activeIndex) {
            return;
        }
        this.setData({
            activeIndex: index,
            'form.month': index == 0 ? 3 : index == 1 ? 6 : 12,
            'form.page': 1,
            loadingVisible: true,
            hasData: true,
            hasMore: true,
            records: [],
            sliderOffset: e.currentTarget.offsetLeft
        });
        this.getRecords();
    },

    /**
     * 获取消费记录或开单记录
     */
    getRecords: function() {
        api.get('weapp/' + this.data.recordType, this.data.form).then(res => {
            let lastPage = 0;
            if (res.errcode === 0) {
                lastPage = this.data.recordType === 'bill' ? res.data.last_page : res.data.last;
                let record = Array.isArray(res.data) ? [] : res.data.data;
                this.setData({
                    records: this.data.records.concat(record)
                });
            }
            let hasMore = res.errcode !== 0 || this.data.form.page >= lastPage ? false : true;
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
        let id = e.currentTarget.dataset.id,
            category = e.currentTarget.dataset.category,
            params = JSON.stringify({
                id: id,
                category: category
            });
        wx.navigateTo({
            url: '/pages/evaluation/evaluation?params=' + params
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const mobile = wx.getStorageSync('systemInfo').windowWidth;
        this.setData({
            recordType: options.type,
            'form.month': options.month,
            sliderWidth: mobile / 3,
            sliderLeft: (app.globalData.windowWidth / this.data.tabs.length - this.data.sliderWidth) / 2,
            sliderOffset: (app.globalData.windowWidth / this.data.tabs.length) * this.data.activeIndex
        });
        let title = options.type === 'bill' ? '开单记录' : options.type === 'count' ? '计次记录' : '消费记录';
        wx.setNavigationBarTitle({ title: title });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.setData({
            loadingVisible: true,
            hasMore: true,
            hasData: true,
            records: [],
            'form.month': 3,
            'form.page': 1
        });
        this.getRecords();
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this.onShow();
    },
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
