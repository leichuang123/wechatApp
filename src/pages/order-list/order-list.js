import api from '../../utils/api';
import { toastMsg, confirmMsg } from '../../utils/util';
import wxPay from '../../utils/requestPayment';
const app = getApp();
const sliderWidth = 57; // 需要设置slider的宽度，用于计算中间位置
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        hasMore: true,
        loadMoreVisible: false,
        sliderOffset: 0,
        sliderLeft: 0,
        sliderWidth: sliderWidth,
        orders: [],
        tabs: ['全部', '待付款', '已付款', '已完成', '待评价'],
        reasons: ['没有时间去，不想要了', '买错了', '其它原因', '门店服务态度不好'],
        orderForm: {
            auth_type: 0,
            auth_related_id: 0,
            type: 0, //1待付款，2已付款，3已完成，4退款
            page: 1
        },
        updateForm: {
            order_id: '',
            payment_method: 1,
            money: 0
        },
        refundForm: {
            order_id: '',
            type: 0,
            reason: ''
        }
    },
    /**
     * 获取订单列表
     */
    getOrders: function() {
        api.get('weapp/order', this.data.orderForm).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    orders: this.data.orders.concat(res.data.items)
                });
            }
            let hasMore = res.errcode !== 0 || this.data.orderForm.page >= res.data.last ? false : true;
            this.setData({
                hasMore: hasMore,
                loadMoreVisible: false,
                loadingVisible: false,
                hasData: this.data.orders.length === 0 ? false : true
            });
        });
    },
    /**
     * 订单支付
     */
    pay: function(e) {
        wx.showLoading();
        let order = e.target.dataset.order;
        const params = {
            order_id: order.id,
            merchant_id: merchant_id
        };
        api.get('/weapp/paysignpackage', params).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                wxPay(
                    res.data,
                    () => {
                        this.setData({
                            'updateForm.order_id': order.id,
                            'updateForm.money': order.actual_pay
                        });
                    },
                    () => {
                        toastMsg('支付失败', 'error');
                    }
                );
            } else {
                confirmMsg('', res.errmsg, false);
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
                    this.setData({
                        orders: [],
                        loadingVisible: true,
                        hasData: true,
                        hasMore: true
                    });
                    this.getOrders();
                });
            } else {
                confirmMsg('', res.errmsg, false);
            }
        });
    },
    /**
     * 申请退款时选择退款理由
     */
    onApplyForRefund: function(e) {
        let item = e.currentTarget.dataset.item;
        if (item.is_online != 1) {
            confirmMsg('', '线下支付的订单不允许退款', false);
            return;
        }
        this.setData({
            'refundForm.order_id': item.id,
            'refundForm.type': item.type
        });
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
        const params = JSON.stringify({ id: e.currentTarget.dataset.item.id, category: 3 }); //订单
        wx.navigateTo({
            url: '/pages/evaluation/evaluation?params=' + params
        });
    },
    /**
     * 跳转到详情页
     *
     */
    gotoDetail: function(e) {
        const status = e.currentTarget.dataset.type;
        const params = JSON.stringify({ id: e.currentTarget.dataset.id, type: status == 4 ? 3 : status });
        wx.navigateTo({
            url: 'detail?params=' + params
        });
    },
    /**
     * 跳转到投诉页面
     */
    gotoComplain: function(e) {
        const item = e.currentTarget.dataset.item;
        const params = JSON.stringify({ order_id: item.id, order_number: item.order_number });
        wx.navigateTo({
            url: '../../paid-service/pages/complain/complain?params=' + params
        });
    },
    /**
     * 确认增值服务订单完成
     */
    confirmFinish: function(e) {
        const id = e.currentTarget.dataset.id;
        api.post('weapp/business-finish', { order_id: id }).then(res => {
            if (res.errcode === 0) {
                toastMsg('确认成功', 'success', 1000, () => {
                    this.setData({
                        'orderForm.type': 3,
                        'orderForm.page': 1,
                        orders: [],
                        loadingVisible: true,
                        hasData: true,
                        hasMore: true
                    });
                    this.getOrders();
                });
            } else {
                confirmMsg('', res.errmsg, false);
            }
        });
    },
    /**
     * 跳转到进度页面
     */
    gotoProgress: function(e) {
        const item = e.currentTarget.dataset.item,
            params = JSON.stringify({
                order_id: item.id,
                order_number: item.order_number,
                name: item.content,
                type: item.type,
                money: item.actual_price
            });
        wx.navigateTo({
            url: '/paid-service/pages/business-progress/business-progress?params=' + params
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            'orderForm.auth_type': app.globalData.extConfig.auth_type || 1,
            'orderForm.auth_related_id': app.globalData.extConfig.auth_related_id || 1,
            'orderForm.type': options.type,
            sliderLeft: (app.globalData.windowWidth / this.data.tabs.length - sliderWidth) / 2,
            sliderOffset: (app.globalData.windowWidth / this.data.tabs.length) * options.type
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.setData({
            hasData: true,
            hasMore: true,
            loadMoreVisible: false,
            loadingVisible: true,
            orders: [],
            'orderForm.page': 1
        });
        this.getOrders();
    },
    /**
     * 切换tab
     */
    tabClick: function(e) {
        let index = e.currentTarget.id;
        if (index == this.data.orderForm.type) {
            return;
        }
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            'orderForm.type': index,
            'orderForm.page': 1,
            orders: [],
            loadingVisible: true,
            hasData: true,
            hasMore: true
        });
        this.getOrders();
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.onShow();
    },
    onReachBottom: function() {
        if (!this.data.hasMore) {
            return;
        }
        this.setData({
            loadMoreVisible: true,
            'orderForm.page': this.data.orderForm.page + 1
        });
        this.getOrders();
    }
});