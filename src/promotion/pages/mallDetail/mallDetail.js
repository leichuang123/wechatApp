import api from '../../../utils/api';
import { showLoading } from '../../../utils/util';
import { host } from '../../../config';
import WxParse from '../../../assets/plugins/wxParse/wxParse';
Page({
    data: {
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        storeForm: {
            merchant_id: 0,
            goods_id: 0,
            page: 1
        },
        goodInfo: {},
        goodImg: [],
        host: host,
        activeIndex: 0,
        loadingVisible: false,
        hasData: true,
        hasMore: true,
        loadMoreVisible: false,
        scrollHeight: 0,
        scrollTop: 59,
        comment: []
    },
    homes: function() {
        wx.switchTab({
            url: '../../../pages/index/index'
        });
    },
    /**
     * 获取门店详情
     */
    getStoreInfo: function() {
        // showLoading();
        api.get('mall-goods/get-goods-detail', this.data.storeForm, false).then(res => {
            wx.hideLoading();
            if (res.errcode == 0) {
                this.setData({
                    goodImg: res.data.goods_img,
                    goodInfo: res.data.goods_detail,
                    comment: this.data.comment.concat(res.data.comment)
                });
                WxParse.wxParse('detail', 'html', res.data.goods_detail.contents, this, 15);
                let hasMore = res.errcode !== 0 || this.data.page >= res.data.last_page ? false : true;
                this.setData({
                    loadMoreVisible: false,
                    loadingVisible: false,
                    hasMore: hasMore,
                    hasData: this.data.comment.length === 0 ? false : true
                });
                return;
            }
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        this.setData({
            'storeForm.merchant_id': bmsWeappStoreInfo.merchant_id,
            'storeForm.goods_id': options.goods_id
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.getStoreInfo();
    },
    /**
     * 切换视图
     */
    changView: function(e) {
        let index = e.target.dataset.index;
        if (index == this.data.activeIndex) {
            return;
        }
        this.setData({
            activeIndex: index
        });
    },
    loadMore: function() {}
});
