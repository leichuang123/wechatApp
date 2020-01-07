import api from '../../utils/api';
import { toastMsg, confirmMsg } from '../../utils/util';
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        queueInfo: [],
        carNumbers: []
    },
    /**
     * 获取排队单号详情
     */
    getQueueInfo: function() {
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        api.get('weapp/queue', {
            car_numbers: this.data.carNumbers,
            store_id: bmsWeappStoreInfo.store_id,
            merchant_id: bmsWeappStoreInfo.merchant_id
        }).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    queueInfo: res.data,
                    loadingVisible: false
                });
                return;
            }
            this.setData({
                queueInfo: [],
                loadingVisible: false,
                hasData: false
            });
        });
    },
    /**
     * 取消排队
     */
    cancelQueue: function(id) {
        api.post('weapp/queuecancel', { id: id }).then(res => {
            if (res.errcode === 0) {
                toastMsg('取消成功', 'success', 1000, () => {
                    this.getQueueInfo();
                });
            } else {
                confirmMsg('', res.errmsg, false);
            }
        });
    },
    /**
     * 取消排队提示
     */
    onCancelQueue: function(e) {
        confirmMsg('', '确定要取消该排号单吗？', true, () => {
            this.cancelQueue(e.currentTarget.id);
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const userData = wx.getStorageSync('userData');
        this.setData({ carNumbers: !!userData ? userData.car : [] });
        this.getQueueInfo();
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.setData({
            queueInfo: [],
            loadingVisible: trur,
            hasData: true
        });
        this.getQueueInfo();
        wx.stopPullDownRefresh();
    }
});
