import { get } from '../../utils/api';
const app = getApp();
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        hasMore: true,
        loadMoreVisible: false,
        records: [],
        page: 1
    },
    /**
     * 获取提现记录
     */
    getRecords: function() {
        get('weapp/withdraw-record-list', { page: this.data.page }).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    records: this.data.records.concat(res.data.data)
                });
            }
            let hasMore = (res.errcode !== 0 || this.data.page >= res.data.last_page) ? false : true;
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
            hasMore: true,
            hasData: true,
            records: [],
            page: 1
        });
        this.getRecords();
    },
    /**
    * 加载更多
    */
    onReachBottom: function () {
        if (!this.data.hasMore) {
            return;
        }
        this.setData({
            loadMoreVisible: true,
            page: this.data.page + 1,
        });
        this.getRecords();
    },
})