import { get } from '../../../utils/api';
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        accounts: []
    },
    /**
     * 获取股东账户列表
     */
    getAccounts: function() {
        get('weapp/get-shareholder').then(res => {
            if (res.errcode === 0) {
                this.setData({
                    accounts: res.data
                });
            }
            this.setData({
                loadingVisible: false,
                hasData: this.data.accounts.length === 0 ? false : true
            });
        });
    },
    /**
     * 跳转到卡详情页
     */
    gotoCardDetail: function(e) {
        let item = e.currentTarget.dataset.item;
        let params = JSON.stringify({
            merchant_id: item.merchant_id,
            store_id: item.store_id,
            shareholder_id: item.shareholder_id,
            customer_id: item.customer_id
        });
        wx.navigateTo({
            url: 'shareable-card?params=' + params
        });
    },
    /**
     * 跳转到我的客源页面
     */
    gotoCustomer: function(e) {
        wx.navigateTo({
            url: 'customer?id=' + e.currentTarget.dataset.id
        });
    },
    /**
     * 跳转到提现页面
     *
     */
    gotoWithdraw: function(e) {
        let item = e.currentTarget.dataset.item;
        let params = JSON.stringify({
            balance: item.balance,
            name: item.name,
            shareholder_id: item.shareholder_id
        });
        wx.navigateTo({
            url: 'withdraw?params=' + params
        });
    },
    /**
     * 跳转到提现记录页面
     */
    gotoWithdrawRecord: function(e) {
        wx.navigateTo({
            url: 'withdraw-record?id=' + e.currentTarget.dataset.id
        });
    },
    /**
     * 跳转到收支明细页面
     */
    gotoIncomeExpenses: function(e) {
        wx.navigateTo({
            url: 'income-expenses?id=' + e.currentTarget.dataset.id
        });
    },
    gotoRecharge: function(e) {
        let item = e.currentTarget.dataset.item;
        let params = JSON.stringify({
            merchant_id: item.merchant_id,
            customer_id: item.customer_id,
            shareholder_id: item.shareholder_id
        });
        wx.navigateTo({
            url: 'recharge?params=' + params
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getAccounts();
    },
});
