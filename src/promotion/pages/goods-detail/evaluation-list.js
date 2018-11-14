import { get } from '../../../utils/api';
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        hasMore: true,
        loadMoreVisible: false,
        evaluations: [],
        form: {
            storeId: 0,
            page: 1
        }
    },
    /**
     * 获取商品详情
     */
    getEvaluations: function(storeId) {
        this.setData({ loadingVisible: true });
        get('weapp/store-evaluation-list', this.data.form, false).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    evaluations: this.data.evaluations.concat(res.data.data),
                    hasMore: this.data.form.page >= res.data.last_page ? false : true,
                });
            } else {
                this.setData({
                    evaluations: this.data.evaluations,
                    hasMore: false,
                });
            }
            this.setData({
                loadingVisible: false,
                hasData: this.data.evaluations.length > 0 ? true : false,
                loadMoreVisible: false
            });
        });
    },
    /**
     * 加载更多
     */
    loadMore: function() {
        if (!this.data.hasMore) {
            return;
        }
        this.setData({
            loadMoreVisible: true,
            'form.page': this.data.form.page + 1,
        });
        this.getEvaluations();
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            'form.storeId': options.storeId
        });
        this.getEvaluations();
    }
})