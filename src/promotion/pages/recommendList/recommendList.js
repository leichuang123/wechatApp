import api from '../../../utils/api';
import { showLoading } from '../../../utils/util';
import { host } from '../../../config';
Page({
    data: {
        goodList: [
            {
                goods_id: 0,
                goods_name: '测试',
                sale_price: 0.0,
                inventory: 0,
                already_num: 0.0,
                goods_img: '/uploads/20200106/202001061619285312.png',
                shortage: false
            }
        ],
        merchant_id: 0,
        host: host,
        keyboardVisible: false,
        bugInfo: {}
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
    bug(e) {
        this.setData({
            keyboardVisible: true,
            bugInfo: e.currentTarget.dataset.item
        });
    },
    hideKeyboard: function() {
        this.setData({
            keyboardVisible: false
        });
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
        //showLoading();
        let params = {
            merchant_id: this.data.merchant_id,
            type: 'all'
        };
        api.get('mall-goods/get-recommend-list', params, false)
            .then(res => {
                wx.hideLoading();
                if (res.errcode === 0) {
                    this.setData({
                        goodList: res.data
                    });
                }
            })
            .catch(() => {
                wx.hideLoading();
            });
    }
});
