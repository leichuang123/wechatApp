import { get } from '../../utils/api';
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        loadMoreVisible: false,
        hasMore: true,
        records: [],
        form: {
            page: 1
        }
    },
    /**
     * 获取用户积分
     */
    getRecords: function() {
        get('weapp/integral', this.data.form).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    records: this.data.records.concat(res.data.items)
                });
            }
            let hasMore = res.errcode !== 0 || this.data.form.page >= res.data.last ? false : true;
            this.setData({
                loadMoreVisible: false,
                loadingVisible: false,
                hasMore: hasMore,
                hasData: this.data.records.length === 0 ? false : true
            });
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
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
        this.getRecords();
    }
});
