import { post } from '../../../utils/api';
import { toastMsg, confirmMsg } from '../../../utils/util';
import wxPay from '../../../utils/requestPayment';
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
            notice: '',
            is_promote: 1,
            order: []
        }
    },
    /**
     * 获取备注
     */
    getNote: function(e) {
        this.setData({
            'form.notice': e.detail.value
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
     * 生成订单表单数据
     */
    generateForm: function() {
        this.setData({
            'form.order[0]': {
                category: this.data.form.category,
                notice: this.data.form.notice,
                money: this.data.form.money,
                content: '',
                is_queue: false,
                goods: [
                    {
                        id: this.data.form.goods_id,
                        price: this.data.form.money,
                        num: 1,
                        type: this.data.form.category
                    }
                ]
            }
        });
    },
    /**
     * 线下支付
     */
    payOffline: function() {
        this.generateForm();
        post('weapp/createstoregoodsorder', this.data.form).then(res => {
            if (res.errcode === 0) {
                wx.navigateTo({
                    url: '../../../pages/order-list/order-list?type=1'
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
     * 在线支付
     */
    payOnline: function(e) {
        this.setData({ loading: true });
        this.generateForm();
        post('weapp/createstoregoodsorder', this.data.form).then(res => {
            this.setData({ loading: false });
            if (res.errcode === 0) {
                let payArgs = res.data;
                wxPay(
                    payArgs,
                    res => {
                        wx.navigateTo({
                            url: 'success?id=' + payArgs.queue_order_id
                        });
                    },
                    res => {
                        toastMsg('支付失败', 'error', 1000, () => {
                            wx.navigateBack({
                                delta: 2
                            });
                        });
                    }
                );
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
     * 选择车牌号
     */
    changeCarNumber: function(e) {
        if (this.data.carIndex == e.detail.value) {
            return false;
        }
        this.setData({
            loading: true,
            carIndex: e.detail.value,
            'form.car_number': this.data.carNumbers[e.detail.value]
        });
    },
    initData(options) {
        const params = JSON.parse(options.params);
        const userData = wx.getStorageSync('userData');
        const defaultCar = !!userData ? userData.default_car : '';
        this.setData({
            'form.goods_id': params.goods_id,
            'form.money': params.money,
            'form.merchant_id': params.merchant_id,
            'form.store_id': params.store_id,
            'form.store_name': params.store_name,
            'form.goods_name': params.goods_name,
            'form.category': params.category,
            'form.car_number': defaultCar,
            'form.mobile': !!userData ? userData.mobile : '',
            carNumbers: !!userData ? userData.car : [],
            carIndex: 0
        });

        if (this.data.carNumbers.length > 0) {
            const index = this.data.carNumbers.indexOf(defaultCar);
            this.setData({ carIndex: index > -1 ? index : 0 });
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.initData(options);
    }
});
