import {
    get
} from '../../../utils/api';
import {
    toastMsg,
    confirmMsg,
    isCarNumber,
    showLoading
} from '../../../utils/util';
Page({
    data: {
        keyboardVisible: false,
        rechargeable: false,
        carNumber: '',
        card: {},
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
        showLoading();
        get('weapp/get-card-info', params).then(res => {
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
            carNumber: e.detail.carNumber,
            'form.car_number': e.detail.carNumber
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
        showLoading('提交请求中');
        get('weapp/recharge', this.data.form).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                toastMsg('充值成功', 'success', 1000, () => {
                    this.goBack();
                });
            } else {
                toastMsg(res.errmsg, 'error', 1000, () => {
                    this.goBack();
                });
            }
        });
    },
    onRecharge: function() {
        const msg = this.validateForm();
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
        this.setData({
            'form.money': this.data.card.balance
        });
        this.onRecharge();
    },
    goBack() {
        wx.navigateBack({
            delta: 1
        });
    },
    cancelRecharge: function() {
        this.goBack();
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const params = JSON.parse(options.params);
        this.setData({
            'form.shareholder_id': params.shareholder_id,
            'form.customer_id': params.customer_id
        });
        this.getCard(params);
    }
});