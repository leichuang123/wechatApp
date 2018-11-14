import { get } from '../../../utils/api';
Page({
    data: {
        loadingVisible: false,
        hasData: true,
        hasMore: true,
        loadMoreVisible: false,
        customers: [],
        form: {
            shareholder_id: 0,
            page: 1
        }
    },
    /**
     * 获取我的客户
     */
    getCustomers: function() {
        this.setData({ loadingVisible: true });
        get('weapp/get-my-customer', this.data.form).then(res => {
            if (res.errcode === 0) {
                this.setData({ customers: this.data.customers.concat(res.data.data) });
            }
            let hasMore = res.errcode !== 0 || this.data.form.page >= res.data.last_page ? false : true;
            this.setData({
                hasMore: hasMore,
                loadMoreVisible: false,
                loadingVisible: false,
                hasData: this.data.customers.length === 0 ? false : true
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
        this.getCustomers();
    },
    /**
     * 下拉刷新
     */
    onPullDownRefresh: function() {
        this.setData({
            loadMoreVisible: false,
            loadingVisible: true,
            hasData: true,
            hasMore: true,
            'form.page': 1,
            customers: []
        });
        this.getCustomers();
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
        this.getCustomers();
    }
});
