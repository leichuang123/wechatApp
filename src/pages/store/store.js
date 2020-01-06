import api from '../../utils/api';
import { host } from '../../config';
import { showLoading } from '../../utils/util';
Page({
    data: {
        loadingVisible: false, //加载中
        hasData: true,
        hasMore: true,
        loadMoreVisible: false, //加载更多
        recommendList: [],
        host: host,
        type: [],
        goodList: [],
        merchant_id: 0,
        first_class_id: '',
        totalPage: 0,
        page: 1
    },
    onLoad: function(options) {
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        this.setData({
            merchant_id: bmsWeappStoreInfo.merchant_id
        });
    },
    onShow: function() {
        this.setData({
            goodList: []
        });
        this.getRecommend();
        this.getType();
        this.getGoodList();
    },
    typeChange: function(e) {
        if (e.currentTarget.dataset.item.goods_class_id == this.data.first_class_id) {
            return;
        }
        this.setData({
            first_class_id: e.currentTarget.dataset.item.goods_class_id,
            page: 1
        });
        this.getGoodList(true);
    },
    seeDetail(e) {
        wx.navigateTo({
            url: '../../promotion/pages/mallDetail/mallDetail?goods_id=' + e.currentTarget.dataset.item.goods_id
        });
    },
    //获取商品全部分类
    getType: function() {
        api.get('mall-goods/get-goods-class-list', { merchant_id: this.data.merchant_id }).then(res => {
            if (res.errcode == 0) {
                let type = res.data;
                type.unshift({ goods_class_name: '全部', goods_class_id: '' });
                this.setData({
                    type: type
                });
            }
        });
    },
    //获取商品
    getGoodList: function(type = false) {
        showLoading();
        api.get('mall-goods/get-goods-list', {
            merchant_id: this.data.merchant_id,
            first_class_id: this.data.first_class_id,
            page: this.data.page
        }).then(res => {
            wx.hideLoading();
            if (res.errcode == 0) {
                let hasMore = res.errcode !== 0 || this.data.page >= res.data.last_page ? false : true;
                this.setData({
                    loadMoreVisible: false,
                    loadingVisible: false,
                    hasMore: hasMore,
                    hasData: this.data.goodList.length === 0 ? false : true
                });
                if (type) {
                    this.setData({
                        goodList: res.data.data,
                        totalPage: res.data.last_page
                    });
                    return;
                }
                this.setData({
                    goodList: this.data.goodList.concat(res.data.data),
                    totalPage: res.data.last_page
                });
            }
        });
    },
    //获取部分推荐商品
    getRecommend: function() {
        let params = {
            merchant_id: this.data.merchant_id,
            type: 'part'
        };
        api.get('mall-goods/get-recommend-list', params, false).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    recommendList: res.data
                });
            }
        });
    },
    //查看更多推荐商品
    seeMore() {
        wx.navigateTo({
            url: '../../promotion/pages/recommendList/recommendList'
        });
    },
    /**
     * 下拉加载更多
     */
    onReachBottom: function() {
        if (!this.data.hasMore || this.data.page >= this.data.totalPage) {
            return;
        }
        this.setData({
            loadMoreVisible: true,
            page: this.data.page + 1
        });
        this.getGoodList();
    }
});
