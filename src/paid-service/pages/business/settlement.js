import { postRequest } from '../../../utils/api';
import { toastMsg, confirmMsg } from '../../../utils/util';
Page({
    data: {
        isAgreed: true,
        businessForm: {},
        orderForm: {
            money: 0,
            nusiness_name: '',
            work_order_id: ''
        },
        payForm: {
            money: 0,
            nusiness_name: '',
            car_number: '',
            work_order_id: '',
            order_id: '',
            order_number: '',
            logo: ''
        }
    },
    /**
     * 监听服务协议是否勾选
     */
    agreeChange: function(e) {
        this.setData({
            isAgreed: e.detail.value.length === 1 ? true : false
        });
    },
    /**
     * 跳转到支付页面
     */
    gotoPay: function(orderData) {
        this.setData({
            'payForm.order_id': orderData.order_id,
            'payForm.order_number': orderData.order_number
        });
        let params = JSON.stringify(this.data.payForm);
        wx.navigateTo({
            url: '../payment/payment?params=' + params,
        });
    },
    /**
     * 跳转到询价成功页面
     */
    gotoEnquirySuccess: function(orderId) {
        wx.navigateTo({
            url: '../enquiry/enquiry?id=' + orderId,
        });
    },
    /**
     * 生成订单
     */
    createOrder: function() {
        wx.showLoading();
        postRequest('weapp/business-create-order', this.data.orderForm, false).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                let orderData = {
                    order_id: res.data.order_id,
                    order_number: res.data.order_number
                };
                if (this.data.businessForm.money === '待定') {
                    this.gotoEnquirySuccess(orderData.order_id);
                    return;
                }
                this.gotoPay(orderData);
            } else {
                confirmMsg('提示', res.errmsg, false, () => {
                    wx.navigateTo({
                        url: '../business/business',
                    });
                });
            }
        });
    },
    /**
     * 结算
     */
    onSettleAccount: function() {
        if (!this.data.isAgreed) {
            toastMsg('请同意相关条款', 'error');
            return;
        }
        this.createOrder();
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let params = JSON.parse(options.params);
        let money = params.money === '待定' ? 0 : params.money;
        this.setData({
            businessForm: params,
            'payForm.money': money,
            'payForm.business_name': params.name,
            'payForm.work_order_id': params.work_order_id,
            'payForm.car_number': params.car_number,
            'payForm.logo': params.logo,
            orderForm: {
                money: money,
                business_name: params.name,
                work_order_id: params.work_order_id,
                notce: params.notice
            }
        });
    }
})