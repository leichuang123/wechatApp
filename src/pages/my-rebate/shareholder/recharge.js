import { getRequest } from '../../../utils/api';
import { toastMsg, confirmMsg, isCarNumber } from '../../../utils/util';
Page({
    data: {
        keyboardVisible: false,
        rechargeable: false,
        carNumber: '',
        card: {},
        cardForm: {
            shareholder_id: 0,
            merchant_id: 0,
            customer_id: 0
        },
        form: {
            shareholder_id: 0,
            customer_id: 0,
            money: 0,
            car_number: ''
        }
    },
    /**
     * 获取股东卡信息
     */
    getCard: function(params) {
        wx.showLoading({ title: '加载中...' });
        getRequest('weapp/get-card-info', params).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({
                    card: res.data
                });
            }
        });
    },
    /**
     *显示键盘
     */
    showKeyboard: function() {
        this.setData({
            keyboardVisible: true
        });
    },
    /**
     * 隐藏键盘
     */
    hideKeyboard: function(e) {
        this.setData({
            keyboardVisible: e.detail.keyboardVisible
        });
    },
    /**
     * 获取车牌号
     */
    getCarNumber: function(e) {
        this.setData({
            carNumber: e.detail.carNumber
        });
    },
    /**
     * 获取充值金额
     */
    getMoney: function(e) {
        this.setData({
            'form.money': e.detail,
            rechargeable: this.data.card.balance >= e.detail ? true : false
        });
    },
    /**
     * 验证表单
     */
    validateForm: function() {
        this.setData({ 'form.car_number': this.data.carNumber });
        if (!isCarNumber(this.data.form.car_number)) {
            return '请填写有效的车牌号';
        } else if (this.data.form.money > this.data.card.balance) {
            return '充值金额须小于账户余额';
        } else {
            return '';
        }
    },
    /**
     * 充值
     */
    recharge: function() {
        wx.showLoading({ title: '提交请求中', mask: true });
        getRequest('weapp/recharge', this.data.form).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                toastMsg('充值成功', 'success', 1000, () => {
                    wx.navigateBack({
                        delta: 1
                    });
                });
            } else {
                toastMsg(res.errmsg, 'error', 1000, () => {
                    wx.navigateBack({
                        delta: 1
                    });
                });
            }
        });
    },
    onRecharge: function() {
        let msg = this.validateForm();
        if (msg !== '') {
            confirmMsg('', msg, false);
        } else {
            this.recharge();
        }
    },
    /**
     * 全部充值
     */
    rechargeAll: function() {
        this.setData({ 'form.money': this.data.card.balance });
        this.onRecharge();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let params = JSON.parse(options.params);
        this.setData({
            'form.shareholder_id': params.shareholder_id,
            'form.customer_id': params.customer_id
        });
        this.getCard(params);
    }
});
