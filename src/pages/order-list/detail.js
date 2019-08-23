import api from '../../utils/api';
import { toastMsg, confirmMsg, showLoading } from '../../utils/util';
import { openLocation } from '../../utils/wx-api';
import wxPay from '../../utils/requestPayment';
Page({
    data: {
        orderInfo: {},
        reasons: ['没有时间去，不想要了', '买错了', '其它原因', '门店服务态度不好'],
        form: {
            order_id: 0,
            type: 0 //1待付款，2已付款，3已完成，4退款
        },
        updateForm: {
            order_id: 0,
            payment_method: 1,
            money: 0
        },
        refundForm: {
            order_id: 0,
            type: 0,
            reason: ''
        }
    },
    /**
     * 获取订单详情
     */
    getOrderInfo: function() {
        showLoading();
        api.get('weapp/orderdetail', this.data.form).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({ orderInfo: res.data });
                return;
            }
            confirmMsg('', res.errmsg, false);
        });
    },
    /**
     * 跳转到订单列表页面
     */
    gotoOrders: function(orderType) {
        wx.navigateTo({
            url: '/pages/order-list/order-list?type=' + orderType
        });
    },
    /**
     * 取消订单
     */
    cancelOrder: function() {
        api.post('weapp/ordercancel', { order_id: this.data.form.order_id }).then(res => {
            if (res.errcode === 0) {
                toastMsg('取消成功', 'success', 1000, () => {
                    this.gotoOrders(1);
                });
            } else {
                confirmMsg('', res.errmsg, false, () => {
                    this.gotoOrders(1);
                });
            }
        });
    },
    /**
     * 取消订单确认
     */
    onCancelOrder: function() {
        confirmMsg('', '确定要取消该订单吗？', true, res => {
            this.cancelOrder();
        });
    },
    /**
     * 订单支付
     */
    pay: function() {
        wx.showLoading();
        api.get('/weapp/paysignpackage', { order_id: this.data.form.order_id }).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                wxPay(
                    res.data,
                    res => {
                        this.setData({
                            'updateForm.order_id': this.data.form.order_id,
                            'updateForm.money': this.data.orderInfo.actual_pay
                        });
                    },
                    res => {
                        toastMsg('支付失败', 'error', 1000, () => {
                            this.gotoOrders(1);
                        });
                    }
                );
            } else {
                confirmMsg('提示', res.errmsg, false, res => {
                    this.gotoOrders(1);
                });
            }
        });
    },
    /**
     * 申请退款
     */
    applyForRefund: function() {
        api.post('weapp/refund', this.data.refundForm).then(res => {
            if (res.errcode === 0) {
                toastMsg('申请成功', 'success', 1000, () => {
                    this.gotoOrders(2);
                });
            } else {
                confirmMsg('', res.errmsg, false, res => {
                    this.gotoOrders(2);
                });
            }
        });
    },
    /**
     * 申请退款时选择退款理由
     */
    onApplyForRefund: function(e) {
        wx.showActionSheet({
            itemList: this.data.reasons,
            success: res => {
                this.setData({
                    'refundForm.reason': this.data.reasons[res.tapIndex]
                });
                this.applyForRefund();
            },
            fail: res => {
                toastMsg(res.errMsg, 'error');
            }
        });
    },
    /**
     * 跳转到评价页面
     */
    gotoEvaluate: function(e) {
        const params = JSON.stringify({
            id: this.data.orderInfo.id,
            category: 3 //订单
        });
        wx.navigateTo({
            url: '/pages/evaluation/evaluation?params=' + params
        });
    },
    /**
     * 定位
     */
    openLocation: function() {
        openLocation({
            latitude: parseFloat(this.data.orderInfo.store_lati),
            longitude: parseFloat(this.data.orderInfo.store_long),
            scale: 18,
            name: this.data.orderInfo.store_name,
            address: this.data.orderInfo.store_address
        });
    },
    /**
     * 跳转到投诉页面
     */
    gotoComplain: function(e) {
        const params = JSON.stringify({
            id: this.data.orderInfo.id,
            category: 3, //订单
            complaint: true
        });
        wx.navigateTo({
            url: '/pages/evaluation/evaluation?params=' + params
        });
    },
    /**
     * 确认增值服务订单完成
     */
    confirmFinish: function(e) {
        api.post('weapp/business-finish', { order_id: this.data.orderInfo.id }).then(res => {
            if (res.errcode === 0) {
                toastMsg('确认成功', 'success', 1000, () => {
                    wx.navigateTo({ url: 'order-list?type=3' });
                });
            } else {
                toastMsg(res.errmsg, 'error');
            }
        });
    },
    /**
     * 跳转到进度页面
     */
    gotoProgresss: function(e) {
        const params = JSON.stringify({
            order_id: this.data.orderInfo.id,
            order_number: this.data.orderInfo.order_number,
            name: this.data.orderInfo.content,
            type: this.data.form.type,
            money: this.data.form.actual_price
        });
        wx.navigateTo({
            url: '/paid-service/pages/business-progress/business-progress?params=' + params
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const params = JSON.parse(options.params);
        this.setData({
            form: {
                order_id: params.id,
                type: params.type
            },
            'refundForm.order_id': params.id,
            'refundForm.type': params.type
        });
        this.getOrderInfo();
    }
});
