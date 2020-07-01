import api from '../../../utils/api';
import { toastMsg, showLoading, confirmMsg } from '../../../utils/util';
Page({
    data: {
        exchange_code: '',
        merchant_id: null,
        store_id: null,
    },
    getInputValue: function (e) {
        const prop = e.currentTarget.dataset.name;
        this.setData({
            [prop]: e.detail.value,
        });
    },
    /**
     * 兑换
     */
    exchangeGo: function () {
        showLoading();
        let param = {
            exchange_code: this.data.exchange_code,
            merchant_id: this.data.merchant_id,
            store_id: this.data.store_id,
        };
        api.post('weapp/jointly-card/weapp-exchange', param)
            .then((res) => {
                wx.hideLoading();
                if (res.errcode != 0) {
                    confirmMsg('', res.errmsg, false);
                    return;
                }
                toastMsg(res.errmsg, 'success', 1000, () => {
                    wx.navigateBack(1);
                });
            })
            .catch(() => {
                wx.hideLoading();
            });
    },
    onLoad: function (options) {
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        if (bmsWeappStoreInfo) {
            this.setData({
                merchant_id: bmsWeappStoreInfo.merchant_id,
                store_id: bmsWeappStoreInfo.store_id,
            });
        }
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {},
});
