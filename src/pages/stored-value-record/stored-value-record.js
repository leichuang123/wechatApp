import { getRequest } from '../../utils/api';
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        hasMore: true,
        loadMoreVisible: false,
        balance: 0,
        records: [],
        form: {
            cardNumber: '',
            timeField: '',
            cardType: 'consume',
            page: 1
        }
    },
    /**
     * 获取储值记录
     */
    getRecords: function() {
        getRequest('weapp/membercardtimescount', this.data.form).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    balance: res.data.balance,
                    records: this.data.records.concat(res.data.list.data)
                });
            }
            let hasMore = (res.errcode !== 0 || this.data.form.page >= res.data.list.last_page) ? false : true;
            this.setData({
                loadMoreVisible: false,
                loadingVisible: false,
                hasMore: hasMore,
                hasData: this.data.records.length === 0 ? false : true
            });
        });
    },
    /**
     * 切换视图
     */
    changeView: function(e) {
        let month = e.currentTarget.dataset.month;
        if (this.data.form.timeField === month) {
            return;
        }
        this.setData({
            records: [],
            loadingVisible: true,
            hasData: true,
            hasMore: true,
            'form.timeField': month,
            'form.page': 1
        })
        this.getRecords();
    },
    /**
     * 下拉加载更多
     */
    loadMore: function() {
        if (!this.data.hasMore) {
            return;
        }
        this.setData({
            loadMoreVisible: true,
            'form.page': this.data.form.page + 1,
        })
        this.getRecords();
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            'form.cardNumber': options.cardNumber,
            'form.timeField': options.month
        });
        this.getRecords();
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.setData({
            records: [],
            loadingVisible: true,
            hasData: true,
            hasMore: true,
            'form.page': 1
        })
        this.getRecords();
    }
})