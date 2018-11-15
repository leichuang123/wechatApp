import { post } from '../../utils/api';
import { confirmMsg, showLoading } from '../../utils/util';
Page({
    data: {
        disabled: true,
        balance: 0,
        account: '',
        form: {
            money: 0,
            type: 1,
            real_name: ''
        }
    },
    /**
     * 表单验证
     */
    validateForm: function() {
        if (this.data.form.real_name === '') {
            return '输入真实姓名';
        }
        if (parseFloat(this.data.form.money) < 30) {
            return '提现金额不得低于30';
        }
        if (parseFloat(this.data.form.money) > parseFloat(this.data.balance)) {
            return '余额不足';
        }
        return '';
    },
    /**
     * 全部提现
     */
    widthdrawAll: function() {
        if (parseFloat(this.data.balance) < 30) {
            return;
        }
        this.setData({ 'form.money': this.data.balance });
        this.onWithdraw();
    },
    /**
     * 提现确认
     */
    onWithdraw: function() {
        const errMsg = this.validateForm();
        if (errMsg !== '') {
            confirmMsg('', msg, false);
        } else {
            this.withdraw();
        }
    },
    /**
     * 提现
     */
    withdraw: function() {
        showLoading();
        post('weapp/withdraw', this.data.form).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                const params = JSON.stringify({
                    money: parseFloat(this.data.form.money).toFixed(2),
                    account: this.data.account
                });
                wx.navigateTo({
                    url: 'success?params=' + params
                });
            } else {
                confirmMsg('', res.errmsg, false, () => {
                    this.gotoMine();
                });
            }
        });
    },
    /**
     * 获取提现金额
     */
    getMoney: function(e) {
        const money = parseFloat(e.detail.value);
        if (money < 30 || money > parseFloat(this.data.balance)) {
            return;
        }
        this.setData({
            'form.money': money,
            disabled: false
        });
    },
    /**
     * 获取用户真实姓名
     */
    getName: function(e) {
        this.setData({
            'form.real_name': e.detail.value
        });
    },
    /**
     * 跳转到我的页面
     */
    gotoMine: function() {
        wx.switchTab({
            url: '/pages/mine/mine'
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const userData = wx.getStorageSync('userData');
        this.setData({
            balance: options.balance,
            account: !!userData ? userData.mobile : ''
        });
    }
});
