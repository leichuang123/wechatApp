import { postRequest } from '../../utils/api';
import { toastMsg, confirmMsg } from '../../utils/util';
import wxPay from '../../utils/requestPayment';
Page({
    data: {
        loading: false,
        form: {
            money: 0,
            stored_value_card: null,
            store_id: 0,
            store_name: '',
            num: 0,
            car_number: '',
            merchant_id: 0,
            mobile: '',
            first_pay: 0,
            order: []
        },
        queueForm: {
            store_id: 0,
            station_type: 0,
            service_item: [],
            car_number: '',
            card_number: '',
            station_type: 0,
            money: 0,
            arrive_pay: '',
            order_id: ''
        }
    },
    /**
     * 获取备注
     */
    getNote: function(e) {
        let order = this.data.form.order;
        let notice = e.detail.value;
        order.forEach(item => {
            item.notice = notice;
        });
        this.setData({
            'form.notice': notice,
            'form.order': order
        });
    },
    /**
     * 跳转到门店列表页
     */
    gotoStores: function() {
        wx.navigateTo({
            url: '/pages/store-list/store-list?type=wash'
        });
    },
    /**
     * 生成排队表单数据
     */
    generateQueueForm: function() {
        let order = this.data.form.order;
        let index = order.findIndex(item => item.is_queue === true);
        if (index !== -1) {
            let item = order[index];
            let serviceItem = [];
            item.goods[0].service_item.forEach(item => {
                serviceItem.push({ id: item.service_id });
            });
            this.setData({
                'queueForm.service_item': serviceItem,
                'queueForm.station_type': item.goods[0].station_type,
                'queueForm.money': item.goods[0].price
            });
        }
    },
    /**
     * 排队取号
     */
    addQueue: function() {
        this.generateQueueForm();
        setTimeout(() => {
            postRequest('weapp/addqueue', this.data.queueForm).then(res => {
                if (res.errcode === 0) {
                    toastMsg('取号成功！', 'success', 1000, () => {
                        let queueData = JSON.stringify(res.data);
                        wx.navigateTo({
                            url: '/pages/queue/detail?queueData=' + queueData
                        });
                    });
                } else {
                    confirmMsg('提示', res.errmsg, false, res => {
                        this.gotoStores();
                    });
                }
            });
        }, 0);
    },
    /**
     * 是否立即取号
     */
    confirmQueue: function() {
        confirmMsg('', '是否立即取号', true, () => {
            this.addQueue();
        }, () => {
            this.gotoStores();
        });
    },
    /**
     * 线下支付
     */
    payOffline: function() {
        postRequest('weapp/createstoregoodsorder', this.data.form).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    'queueForm.order_id': res.data.queue_order_id,
                    'queueForm.arrive_pay': 'Y'
                });
                let storeStatus = wx.getStorageSync('currentStore').status;
                if (this.data.form.is_queue && storeStatus) {
                    this.confirmQueue();
                } else {
                    wx.navigateTo({
                        url: '/pages/order-list/order-list?type=1'
                    });
                }
            } else {
                confirmMsg('提示', res.errmsg, false, () => {
                    wx.navigateBack({
                        delta: 2
                    });
                });
            }
        });
    },
    /**
     * 在线支付
     */
    payOnline: function(e) {
        this.setData({ loading: true });
        postRequest('weapp/createstoregoodsorder', this.data.form).then(res => {
            this.setData({ loading: false });
            if (res.errcode === 0) {
                let payArgs = res.data;
                wxPay(payArgs, () => {
                    this.setData({
                        'queueForm.order_id': payArgs.queue_order_id,
                        'queueForm.arrive_pay': 'N'
                    });
                    let storeStatus = wx.getStorageSync('currentStore').status;
                    if (this.data.form.is_queue && storeStatus) {
                        this.confirmQueue();
                    } else {
                        wx.navigateTo({
                            url: '/pages/payment/success?id=' + payArgs.queue_order_id
                        });
                    }
                }, () => {
                    toastMsg('支付失败', 'error', 1000, () => {
                        wx.navigateBack({
                            delta: 2
                        });
                    });
                });
            } else {
                confirmMsg('提示', res.errmsg, false, () => {
                    wx.navigateBack({
                        delta: 2
                    });
                });
            }
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let params = JSON.parse(options.params);
        console.log(params)
        this.setData({
            form: params,
            'queueForm.store_id': params.store_id,
            'queueForm.car_number': params.car_number
        });
    }
});