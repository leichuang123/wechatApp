import { get } from '../../../utils/api';
import { confirmMsg } from '../../../utils/util';
import wxPay from '../../../utils/requestPayment';
Page({
    data: {
        form: {
            work_order_id: '',
            money: 0,
            business_name: '',
            order_id: '',
            order_number: '',
        }
    },
    /**
     * 生成支付参数
     */
    generatePayParams: function() {
        wx.showLoading();
        get('weapp/paysignpackage', { order_id: this.data.form.order_id }).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.pay(res.data);
            } else {
                confirmMsg('提示', res.errmsg, false);
            }
        });
    },
    /**
     * 支付
     */
    pay: function(payArgs) {
        wxPay(payArgs, () => {
            let params = JSON.stringify({
                id: this.data.form.order_id,
                money: this.data.form.money
            });
            wx.navigateTo({
                url: 'pay-success?params=' + params,
            });
        }, () => {
            confirmMsg('提示', '支付失败', false);
        });
    },
    /**
     * 发起支付
     */
    onPay: function() {
        this.generatePayParams();
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let params = JSON.parse(options.params);
        this.setData({
            form: params
        });
    }
})