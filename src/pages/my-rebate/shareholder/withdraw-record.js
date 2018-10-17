import { getRequest } from '../../../utils/api';
const app = getApp();
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        hasMore: true,
        loadMoreVisible: false,
        records: [],
        form: {
            shareholder_id: 0,
            page: 1
        }
    },
    /**
     * 获取提现记录
     */
    getRecords: function() {
        getRequest('weapp/get-record-list', this.data.form).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    records: this.data.records.concat(res.data.data)
                });
            }
            let hasMore = (res.errcode !== 0 || this.data.form.page >= res.data.last_page) ? false : true;
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
        this.setData({
            'form.shareholder_id': options.id
        });
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
            'form.page': 1
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
            page: this.data.form.page + 1,
        });
        this.getRecords();
    }
})