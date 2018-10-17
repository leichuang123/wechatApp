import api from '../../utils/api';
import { toastMsg, confirmMsg } from '../../utils/util';
import { add, subtract } from '../../utils/calculate';
import { openLocation } from '../../utils/wx-api';
Page({
    data: {
        washSelected: false,
        loading: false,
        open: true,
        collected: false,
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        money: 0,
        storeInfo: {},
        recommendedGoods: [],
        washGoods: {},
        serviceGoods: [],
        recommendedMoney: 0,
        washMoney: 0,
        serviceMoney: 0,
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
        carNumbers: [],
        carIndex: 0,
        goodsForm: {
            storeId: 0,
            merchantId: 0,
            car_number: ''
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
            order: []
        },
        memberForm: {
            store_id: 0,
            car_number: '',
            merchant_id: 0,
            isRegistered: false,
        },
        storeForm: {
            storeId: 0,
            merchantId: 0,
            latitude: 0,
            longitude: 0,
        }
    },
    /**
     * 获取门店详情
     */
    getStoreInfo: function() {
        api.getRequest('weapp/storedetail', this.data.storeForm, false).then(res => {
            this.setData({ loading: false });
            if (res.errcode === 0) {
                this.setData({
                    storeInfo: res.data,
                    collected: res.data.favorite_status
                });
            }
        });
    },
    /**
     * 获取商品列表
     */
    getGoods: function() {
        this.setData({ loading: true });
        api.getRequest('weapp/storegoodsitem', this.data.goodsForm, false).then(res => {
            if (res.errcode === 0) {
                let hasWashGoods = res.data.store_wash_goods.length > 0;
                this.setData({
                    loading: false,
                    recommendedGoods: res.data.store_recommend,
                    washGoods: hasWashGoods ? res.data.store_wash_goods[0] : {},
                    serviceGoods: res.data.store_goods,
                    'washGoods.open': hasWashGoods,
                });
            } else {
                this.setData({
                    loading: false,
                    recommendedGoods: [],
                    washGoods: {},
                    serviceGoods: [],
                });
            }
        });
    },
    /**
     * 收藏与取消
     */
    switchCollection: function() {
        let operation = !this.data.collected ? 'addfavor' : 'delfavor';
        api.postRequest('weapp/' + operation, { store_id: this.data.goodsForm.storeId }).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    collected: !this.data.collected,
                });
                return;
            }
            toastMsg(res.errmsg, 'error');
        });
    },
    /**
     * 选择首页推荐里的商品
     */
    chooseRecommendedGoods: function(e) {
        let index = e.currentTarget.id,
            items = this.data.recommendedGoods,
            money = 0,
            isQueue = e.currentTarget.dataset.queue;
        if (!items[index].checked && this.data.washSelected && isQueue) {
            confirmMsg('提示', '只能选择一种清洗类的商品', false);
            return;
        }
        items[index].checked = !items[index].checked;
        if (items[index].checked) {
            money = add(this.data.recommendedMoney, this.data.recommendedGoods[index].sale_price);
        } else {
            money = subtract(this.data.recommendedMoney, this.data.recommendedGoods[index].sale_price);
        }
        this.setData({
            recommendedGoods: items,
            recommendedMoney: money
        });
        if (isQueue == 1) {
            this.setData({
                'washGoodsOrder.is_queue': items[index].checked,
                'orderForm.first_pay': items[index].checked ? 1 : 0,
                washSelected: items[index].checked,
            })
        }
        this.sum();
    },
    /**
     * 选择清洗类的商品
     */
    chooseWashGoods: function(e) {
        let index = e.currentTarget.id,
            items = this.data.washGoods.goods;
        if (!items[index].checked) {
            if (this.data.washSelected) {
                confirmMsg('提示', '只能选择一种清洗类的商品', false);
                return;
            }
            items[index].checked = true;
            this.setData({
                washSelected: true,
                'washGoodsOrder.is_queue': true,
                'orderForm.first_pay': 1,
                'washGoods.goods': items,
                washMoney: items[index].sale_price,
            });
            this.sum();
        } else {
            items[index].checked = false;
            this.setData({
                washSelected: false,
                'washGoodsOrder.is_queue': false,
                'orderForm.first_pay': 0,
                'washGoods.goods': items,
                washMoney: 0,
            });
            this.sum();
        }
    },
    /**
     * 选择服务类的商品
     */
    chooseServiceGoods: function(e) {
        let pIndex = e.currentTarget.dataset.index;
        let index = e.currentTarget.id;
        let items = this.data.serviceGoods;
        items[pIndex].goods[index].checked = !items[pIndex].goods[index].checked;
        let money = 0;
        if (items[pIndex].goods[index].checked) {
            money = add(this.data.serviceMoney, items[pIndex].goods[index].sale_price);
        } else {
            money = subtract(this.data.serviceMoney, items[pIndex].goods[index].sale_price);
        }
        this.setData({
            serviceGoods: items,
            serviceMoney: money
        });
        this.sum();
    },
    /**
     * 计算金额
     */
    sum: function() {
        let amount = [this.data.recommendedMoney, this.data.washMoney, this.data.serviceMoney].reduce((acc, cur) => add(acc, cur));
        this.setData({
            money: amount
        });
    },
    /**
     * 折叠与展开门店推荐商品
     */
    toggleRecommendedGoods: function(e) {
        this.setData({
            open: !this.data.open
        });
    },
    /**
     * 折叠与展开清洗类商品
     */
    toggleWashGoods: function(e) {
        this.setData({
            'washGoods.open': !this.data.washGoods.open
        });
    },
    /**
     * 展开与折叠服务项目
     */
    toggleServiceGoods: function(e) {
        let currentIndex = e.currentTarget.dataset.index,
            items = this.data.serviceGoods,
            findIndex = items.findIndex((item, index) => currentIndex == index);
        if (findIndex !== -1) {
            items[findIndex].open = !items[findIndex].open;
        }
        this.setData({
            serviceGoods: items
        });
    },
    /**
     * 跳转到支付页面
     */
    gotoPay: function() {
        let params = JSON.stringify(this.data.orderForm);
        wx.navigateTo({
            url: '/pages/payment/payment?params=' + params,
        });
    },
    /**
     * 计算首页推荐里的商品
     */
    calculateRecommnededGoods: function() {
        let goods = {},
            item = {},
            recommendedGoods = this.data.recommendedGoods,
            len = recommendedGoods.length,
            goodsOfWash = this.data.washGoodsOrder.goods,
            goodsOfService = this.data.serviceGoodsOrder.goods,
            goodsOfPackage = this.data.packageOrder.goods,
            goodsOfValueCard = this.data.valueCardOrder.goods;
        if (len > 0) {
            for (let i = 0; i < len; i++) {
                item = recommendedGoods[i]
                if (item.checked) {
                    this.setData({
                        'orderForm.num': this.data.orderForm.num + 1,
                    })
                    if (item.category == 0) {
                        let service = !!item.recommend ? item.recommend.service : [];
                        goods = {
                            id: item.relate_id,
                            price: item.sale_price,
                            num: 1,
                            type: 0,
                            name: item.featured_name,
                            service_item: service.length > 0 ? service : [],
                            service_name: service.length > 0 ? service[0].name : '',
                            station_type: service.length > 0 ? service[0].station_type : 0,
                            is_queue: item.is_queue == 1
                        }
                        if (goods.is_queue && service.length > 0) {
                            goodsOfWash.push(goods);
                            this.setData({
                                'washGoodsOrder.money': add(this.data.washGoodsOrder.money, item.sale_price),
                                'washGoodsOrder.is_queue': true,
                                'washGoodsOrder.goods': goodsOfWash,
                                'orderForm.is_queue': true
                            });
                        } else {
                            goodsOfService.push(goods);
                            this.setData({
                                'serviceGoodsOrder.money': add(this.data.serviceGoodsOrder.money, item.sale_price),
                                'serviceGoodsOrder.goods': goodsOfService
                            })
                        }
                    }
                    if (item.category == 1) {
                        goods = {
                            id: item.relate_id,
                            price: item.sale_price,
                            num: 1,
                            type: 1,
                            name: item.featured_name,
                        }
                        goodsOfPackage.push(goods);
                        this.setData({
                            'packageOrder.money': add(this.data.packageOrder.money, item.sale_price),
                            'packageOrder.is_queue': false,
                            'packageOrder.goods': goodsOfPackage
                        })
                    }
                    if (item.category == 2) {
                        goods = {
                            id: item.relate_id,
                            price: item.sale_price,
                            num: 1,
                            type: 2,
                            name: item.featured_name,
                        }
                        goodsOfValueCard.push(goods);
                        this.setData({
                            'valueCardOrder.money': add(this.data.valueCardOrder.money, item.sale_price),
                            'valueCardOrder.is_queue': false,
                            'valueCardOrder.goods': goodsOfValueCard
                        });
                    }
                }
            }
        }
    },
    /**
     * 计算清洗服务 的商品
     */
    calculateWashGoods: function() {
        let goods = {},
            item = {},
            washGoods = this.data.washGoods,
            goodsOfWash = this.data.washGoodsOrder.goods,
            len = !washGoods.goods ? 0 : washGoods.goods.length;
        if (len > 0) {
            for (let i = 0; i < len; i++) {
                item = washGoods.goods[i];
                if (item.checked) {
                    let service = item.service;
                    goods = {
                        id: item.goods_id,
                        price: item.sale_price,
                        num: 1,
                        type: 0,
                        name: item.goods_name,
                        service_item: service.length > 0 ? service : [],
                        service_name: service.length > 0 ? service[0].service_name : '',
                        station_type: service.length > 0 ? service[0].station_type : 0,
                        is_queue: !!service && washGoods.is_queue == 1
                    }
                    goodsOfWash.push(goods);
                    this.setData({
                        'orderForm.num': this.data.orderForm.num + 1,
                        'washGoodsOrder.money': add(this.data.washGoodsOrder.money, item.sale_price),
                        'washGoodsOrder.goods': goodsOfWash,
                        'orderForm.is_queue': goods.is_queue,
                        'washGoodsOrder.is_queue': goods.is_queue,
                    })
                }
            }
        }
    },
    /**
     * 计算保养类服务的商品
     */
    calcuteServiceGoods: function() {
        let goods = {},
            item = {},
            goodsOfWash = this.data.washGoodsOrder.goods,
            goodsOfService = this.data.serviceGoodsOrder.goods;
        if (this.data.serviceGoods.length > 0) {
            for (let i = 0, len = this.data.serviceGoods.length; i < len; i++) {
                for (let j = 0, _len = this.data.serviceGoods[i].goods.length; j < _len; j++) {
                    item = this.data.serviceGoods[i].goods[j];
                    if (item.checked) {
                        let service = item.service;
                        goods = {
                            id: item.goods_id,
                            price: item.sale_price,
                            num: 1,
                            type: 0,
                            name: item.goods_name,
                            service_item: service.length > 0 ? service : [],
                            service_name: service.length > 0 ? service[0].service_name : '',
                            station_type: service.length > 0 ? service[0].station_type : 0,
                            is_queue: this.data.serviceGoods[i].is_queue == 1
                        }
                        if (goods.is_queue && service.length > 0) {
                            goodsOfWash.push(goods);
                            this.setData({
                                'orderForm.is_queue': true,
                                'orderForm.num': this.data.orderForm.num + 1,
                                'washGoodsOrder.goods': goodsOfWash,
                                'washGoodsOrder.money': add(this.data.washGoodsOrder.money, item.sale_price)
                            });
                        } else {
                            goodsOfService.push(goods);
                            this.setData({
                                'orderForm.num': this.data.orderForm.num + 1,
                                'serviceGoodsOrder.goods': goodsOfService,
                                'serviceGoodsOrder.money': add(this.data.serviceGoodsOrder.money, item.sale_price)
                            });
                        }
                    }
                }
            }
        }
    },
    /**
     * 结算
     */
    settleAccounts: function() {
        if (this.data.money > 0) {
            this.setData({
                'valueCardOrder.goods': [],
                'packageOrder.goods': [],
                'washGoodsOrder.goods': [],
                'serviceGoodsOrder.goods': [],
                'orderForm.order': [],
                'orderForm.num': 0
            });
            this.calculateRecommnededGoods();
            this.calculateWashGoods();
            this.calcuteServiceGoods();
            let order = [];
            setTimeout(() => {
                if (this.data.valueCardOrder.goods.length > 0) {
                    order.push(this.data.valueCardOrder);
                }
                if (this.data.washGoodsOrder.goods.length > 0) {
                    order.push(this.data.washGoodsOrder)
                }
                if (this.data.serviceGoodsOrder.goods.length > 0) {
                    order.push(this.data.serviceGoodsOrder)
                }
                if (this.data.packageOrder.goods.length > 0) {
                    order.push(this.data.packageOrder);
                }
                this.setData({
                    'orderForm.order': order,
                    'orderForm.money': this.data.money
                });
                console.log(order);
                this.gotoPay();
            }, 500)
        }
    },
    /**
     * 结算前验证是否注册
     */
    onSettleAccounts: function() {
        if (this.data.money > 0) {
            if (this.data.memberForm.isRegistered) {
                this.settleAccounts();
            } else {
                wx.navigateTo({
                    url: '/pages/register/register',
                });
            }
        }
    },
    /**
     * 选择车牌号
     */
    changeCarNumber: function(e) {
        if (this.data.carIndex == e.detail.value) {
            return;
        }
        this.setData({
            loading: true,
            carIndex: e.detail.value,
            'orderForm.car_number': this.data.carNumbers[e.detail.value],
            'goodsForm.car_number': this.data.carNumbers[e.detail.value]
        });
        this.getGoods();
    },
    /**
     * 定位
     */
    openLocation: function() {
        let store = this.data.storeInfo;
        let latitude = parseFloat(store.store_lati);
        let longitude = parseFloat(store.store_long);
        let params = {
            latitude: latitude,
            longitude: longitude,
            scale: 18,
            name: store.store_name,
            address: store.store_address,
        }
        openLocation(params);
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let memberData = JSON.parse(options.memberData);
        let userData = wx.getStorageSync('userData');
        let defaultCar = !!userData ? userData.user_data.default_car : '';
        let carNumber = memberData.car_number ? memberData.car_number : defaultCar;
        this.setData({
            goodsForm: {
                storeId: memberData.store_id,
                merchantId: memberData.merchant_id,
                car_number: carNumber,
            },
            storeForm: {
                storeId: memberData.store_id,
                merchantId: memberData.merchant_id,
                latitude: memberData.latitude,
                longitude: memberData.longitude,
            },
            carNumbers: !!userData ? userData.user_data.car : [],
            carIndex: 0,

            'orderForm.merchant_id': memberData.merchant_id,
            'orderForm.store_id': memberData.store_id,
            'orderForm.store_name': memberData.store_name,
            'orderForm.car_number': carNumber,
            'orderForm.mobile': !!userData ? userData.user_data.mobile : '',

            'memberForm.merchant_id': memberData.merchant_id,
            'memberForm.store_id': memberData.store_id,
            'memberForm.isRegistered': !!userData ? userData.isRegist : false,
            'memberForm.car_number': carNumber,
        });
        if (this.data.carNumbers.length > 0) {
            let index = this.data.carNumbers.findIndex(value => carNumber === value);
            this.setData({ carIndex: index > -1 ? index : 0 });
        }
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.getStoreInfo();
        this.getGoods();
    },
    onHide: function() {
        this.setData({
            washSelected: false,
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
            'packageOrder.is_queue: false': 0,
            'packageOrder.goods': [],
            'washGoodsOrder.money': 0,
            'washGoodsOrder.is_queue:': false,
            'washGoodsOrder.goods': [],
            'serviceGoodsOrder.money': 0,
            'serviceGoodsOrder.is_queue:': false,
            'serviceGoodsOrder.goods': [],
            'orderForm.order': [],
            'washGoods.open': true,
            open: true
        });
    }
})