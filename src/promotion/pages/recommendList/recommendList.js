import api from '../../../utils/api';
import { showLoading } from '../../../utils/util';
import { host } from '../../../config';
Page({
    data: {
        goodList: [],
        merchant_id: 0,
        host: host
    },
    onLoad: function(options) {
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        this.setData({
            merchant_id: bmsWeappStoreInfo.merchant_id
        });
    },
    onShow: function() {
        this.getRecommend();
    },
    seeDetail(e) {
        wx.navigateTo({
            url: '../mallDetail/mallDetail?goods_id=' + e.currentTarget.dataset.item.goods_id
        });
    },
    /**
     * 获取全部推荐商品
     */
    getRecommend: function() {
        showLoading();
        let params = {
            merchant_id: this.data.merchant_id,
            type: 'all'
        };
        api.get('mall-goods/get-recommend-list', params, false).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({
                    goodList: res.data
                });
            }
        });
    }
});
