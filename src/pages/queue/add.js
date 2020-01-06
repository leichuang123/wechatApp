import api from '../../utils/api';
import { toastMsg, confirmMsg, showLoading } from '../../utils/util';
Page({
    data: {
        open: true,
        washSelected: false,
        queueDisabled: true,
        hasMemberService: false,
        tabIndex: 0,
        carIndex: 0,
        money: 0,
        recommendedMoney: 0,
        washMoney: 0,
        serviceMoney: 0,
        cardServices: [],
        washServices: [],
        boughtServices: [],
        recommendedGoods: [],
        washGoods: {},
        serviceGoods: [],
        carNumbers: [],
        valueCardOrder: {
            money: 0,
            category: 2,
            content: '',
            notice: '',
            goods: [],
            is_queue: false
        },
        packageOrder: {
            money: 0,
            category: 1,
            content: '',
            notice: '',
            goods: [],
            is_queue: false
        },
        washGoodsOrder: {
            money: 0,
            category: 0,
            content: '',
            notice: '',
            goods: [],
            is_queue: false
        },
        serviceGoodsOrder: {
            money: 0,
            category: 0,
            content: '',
            notice: '',
            goods: [],
            is_queue: false
        },
        form: {
            store_id: 0,
            station_type: 0,
            service_item: [],
            car_number: '',
            money: 0,
            arrive_pay: 'N',
            card_number: '',
            goods_id: null
        },
        orderForm: {
            store_id: 0,
            store_name: '',
            money: 0,
            num: 0,
            content: '',
            car_number: '',
            merchant_id: 0,
            mobile: '',
            first_pay: 0,
            order: [],
            is_queue: false
        },
        TYPE_GOODS: 0,
        TYPE_PACKAGE: 1,
        TYPE_VALUE_CARD: 2
    },

    /**
     * 返回到上一页
     */
    goBack: function() {
        wx.navigateBack({
            delta: 1
        });
    },
    addQueue: function() {
        api.post('weapp/addqueue', this.data.form).then(res => {
            if (res.errcode === 0) {
                toastMsg('取号成功', 'success', 1000, () => {
                    wx.navigateTo({ url: 'detail?queueData=' + JSON.stringify(res.data) });
                });
            } else {
                confirmMsg('提示', res.errmsg, false);
            }
        });
    },
    changeCarNumber: function(e) {
        if (this.data.carIndex == e.detail.value) {
            return;
        }
        this.setData({
            carIndex: e.detail.value,
            'form.car_number': this.data.carNumbers[e.detail.value],
            'orderForm.car_number': this.data.carNumbers[e.detail.value]
        });
        this.data.tabIndex == 0 ? this.getServices() : this.getGoods();
    },
    initData(options) {
        const params = JSON.parse(options.params);
        const userData = wx.getStorageSync('userData');
        const carNumber = !!userData ? userData.default_car : '';
        this.setData({
            'form.store_id': params.store_id,
            'form.car_number': carNumber,

            'orderForm.merchant_id': params.merchant_id,
            'orderForm.store_id': params.store_id,
            'orderForm.car_number': carNumber,
            'orderForm.store_name': params.store_name,
            'orderForm.mobile': userData.mobile,

            carNumbers: !!userData ? userData.car : []
        });
        if (this.data.carNumbers.length > 0) {
            const index = this.data.carNumbers.findIndex(value => carNumber === value);
            this.setData({ carIndex: index > -1 ? index : 0 });
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.initData(options);
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {},
    onHide: function() {
        this.setData({
            washSelected: false,
            cardServices: [],
            washServices: [],
            boughtServices: [],
            recommendedGoods: [],
            washGoods: {},
            serviceGoods: [],
            money: 0,
            recommendedMoney: 0,
            washMoney: 0,
            serviceMoney: 0,
            'valueCardOrder.money': 0,
            'valueCardOrder.is_queue': false,
            'valueCardOrder.goods': [],
            'packageOrder.money': 0,
            'packageOrder.is_queue': false,
            'packageOrder.goods': [],
            'washGoodsOrder.money': 0,
            'washGoodsOrder.is_queue': false,
            'washGoodsOrder.goods': [],
            'serviceGoodsOrder.money': 0,
            'serviceGoodsOrder.is_queue': false,
            'serviceGoodsOrder.goods': [],
            'orderForm.order': [],
            'washGoods.open': true,
            open: true
        });
    }
});
