import api from '../../../utils/api';
import { showLoading, toastMsg, confirmMsg } from '../../../utils/util';
import { host } from '../../../config';
Page({
    data: {
        goods_list: [],
        store_id: 0,
        merchant_id: 0,
        addressInfo: {},
        productList: [],
        total_amount: 0.0,
        postage_total_amount: 0.0,
        goods_total_amount: 0.0
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        this.setData({
            goods_list: JSON.parse(options.goods_list),
            merchant_id: bmsWeappStoreInfo.merchant_id,
            store_id: bmsWeappStoreInfo.store_id
        });
    },
    onShow: function() {
        this.getOrder();
    },
    getOrder: function() {
        showLoading();
        let params = {
            goods_list: this.data.goods_list,
            merchant_id: this.data.merchant_id,
            store_id: this.data.store_id
        };
        api.post('/weapp/mall-buy/settlement', params).then(res => {
            wx.hideLoading();
            if (res.errcode !== 0) {
                confirmMsg('', res.errmsg, false, () => {
                    wx.navigateBack({
                        delta: 1
                    });
                });
                return;
            }
            this.setData({
                addressInfo: res.data.receive_goods_info[0],
                productList: res.data.goods_list,
                goods_total_amount: res.data.goods_total_amount,
                postage_total_amount: res.data.postage_total_amount,
                total_amount: res.data.total_amount
            });
        });
    },
    sumitOrder: function() {
        confirmMsg('', '确定提交订单？', true, () => {});
    }
});
