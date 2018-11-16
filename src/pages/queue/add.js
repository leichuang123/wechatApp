import api from '../../utils/api';
import { toastMsg, confirmMsg, showLoading } from '../../utils/util';
import { add, subtract } from '../../utils/calculate';
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
     * 选择会员卡服务
     */
    chooseCardService: function(e) {
        let index = e.currentTarget.dataset.index,
            cItems = this.data.cardServices,
            bItems = this.data.boughtServices;
        cItems[index].checked = !cItems[index].checked;
        if (cItems[index].checked) {
            cItems = cItems.map((n, i) => {
                return Object.assign({}, n, {
                    checked: i == index
                });
            });
            bItems = bItems.map((n, i) => {
                return Object.assign({}, n, {
                    checked: false
                });
            });
            this.setData({
                cardServices: cItems,
                boughtServices: bItems,
                'form.card_number': cItems[index].card_number,
                'form.service_item': [{ id: cItems[index].service_id }],
                'form.money': cItems[index].service_price,
                'form.station_type': cItems[index].station_type,
                'form.arrive_pay': 'N',
                queueDisabled: false
            });
        } else {
            this.setData({
                cardServices: cItems,
                'form.card_number': '',
                'form.service_item': [],
                'form.money': 0,
                'form.station_type': 0,
                'form.arrive_pay': '',
                queueDisabled: true
            });
        }
    },
    /**
     * 选择已购买的服务
     */
    chooseBoughtService: function(e) {
        let index = e.currentTarget.dataset.index;
        let bItems = this.data.boughtServices,
            cItems = this.data.cardServices;
        bItems[index].checked = !bItems[index].checked;
        if (bItems[index].checked) {
            cItems = cItems.map((n, i) => {
                return Object.assign({}, n, {
                    checked: false
                });
            });
            bItems = bItems.map((n, i) => {
                return Object.assign({}, n, {
                    checked: i == index
                });
            });
            this.setData({
                boughtServices: bItems,
                cardServices: cItems,
                'form.goods_id': bItems[index].goods_id,
                'form.goods_name': bItems[index].goods_name,
                'form.service_item': [{ id: bItems[index].service_id }],
                'form.money': bItems[index].sale_price,
                'form.station_type': bItems[index].station_type,
                'form.arrive_pay': bItems[index].is_pay == '未支付' ? 'Y' : 'N',
                'orderForm.money': bItems[index].sale_price,
                'orderForm.num': 1,
                'orderForm.is_queue': true,
                queueDisabled: false
            });
        } else {
            this.setData({
                boughtServices: bItems,
                'form.service_item': [],
                'form.money': 0,
                'form.station_type': 0,
                'form.arrive_pay': '',
                'orderForm.money': 0,
                'orderForm.num': 0,
                'orderForm.is_queue': false,
                queueDisabled: true
            });
        }
    },
    /**
     * 返回到上一页
     */
    goBack: function() {
        wx.navigateBack({
            delta: 1
        });
    },
    /**
     * 获取客户卡里的服务、已购服务和优惠券
     */
    getServices: function() {
        showLoading();
        const params = {
            merchant_id: this.orderForm.store_id,
            merchant_id: this.orderForm.merchant_id,
            car_number: this.orderForm.car_number
        };
        api.get('weapp/customerservice', params).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                const hasMemberService = res.data.card.length > 0 || res.data.buy.length > 0;
                this.setData({
                    cardServices: res.data.card,
                    boughtServices: res.data.buy,
                    hasMemberService: hasMemberService
                });
            } else {
                this.setData({ cardServices: [], boughtServices: [], hasMemberService: false });
            }
        });
    },
    /**
     * 排队取号
     */
    addQueue: function() {
        api.post('weapp/addqueue', this.data.form).then(res => {
            if (res.errcode === 0) {
                toastMsg('取号成功', 'success', 1000, () => {
                    let queueData = JSON.stringify(res.data);
                    wx.navigateTo({
                        url: 'detail?queueData=' + queueData
                    });
                });
            } else {
                confirmMsg('提示', res.errmsg, false);
            }
        });
    },
    /**
     * 切换视图
     */
    changeView: function(e) {
        let index = e.target.dataset.index;
        if (index == this.data.tabIndex) {
            return;
        }
        this.setData({
            washSelected: false,
            tabIndex: index,
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
        index == 0 ? this.getServices() : this.getGoods();
    },
    /**
     * 选择车牌号
     */
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
    /**
     * 获取服务项目
     */
    getGoods: function() {
        showLoading();
        const params = {
            storeId: this.orderForm.store_id,
            merchantId: this.orderForm.merchant_id,
            car_number: this.orderForm.car_number
        };
        api.get('weapp/storegoodsitem', params, false).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                let hasWashGoods = res.data.store_wash_goods.length > 0;
                this.setData({
                    recommendedGoods: res.data.store_recommend,
                    washGoods: hasWashGoods ? res.data.store_wash_goods[0] : {},
                    serviceGoods: res.data.store_goods,
                    'washGoods.open': hasWashGoods
                });
            } else {
                this.setData({ recommendedGoods: [], washGoods: {}, serviceGoods: [] });
            }
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
                washSelected: items[index].checked
            });
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
                washMoney: parseFloat(this.data.washGoods.goods[index].sale_price)
            });
            this.sum();
        } else {
            items[index].checked = false;
            this.setData({
                washSelected: false,
                'washGoodsOrder.is_queue': false,
                'orderForm.first_pay': 0,
                'washGoods.goods': items,
                washMoney: 0
            });
            this.sum();
        }
    },
    /**
     * 选择服务类的商品
     */
    chooseServiceGoods: function(e) {
        let pIndex = e.currentTarget.dataset.index,
            index = e.currentTarget.id,
            items = this.data.serviceGoods;
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
        let amount = [this.data.recommendedMoney, this.data.washMoney, this.data.serviceMoney].reduce((acc, cur) =>
            add(acc, cur)
        );
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
            url: '/pages/payment/payment?params=' + params
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
                item = recommendedGoods[i];
                if (item.checked) {
                    this.setData({
                        'orderForm.num': this.data.orderForm.num + 1
                    });
                    if (item.category == this.TYPE_GOODS) {
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
                        };
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
                            });
                        }
                    }
                    if (item.category == this.TYPE_PACKAGE) {
                        goods = {
                            id: item.relate_id,
                            price: item.sale_price,
                            num: 1,
                            type: 1,
                            name: item.featured_name
                        };
                        goodsOfPackage.push(goods);
                        this.setData({
                            'packageOrder.money': add(this.data.packageOrder.money, item.sale_price),
                            'packageOrder.is_queue': false,
                            'packageOrder.goods': goodsOfPackage
                        });
                    }
                    if (item.category == this.TYPE_VALUE_CARD) {
                        goods = {
                            id: item.relate_id,
                            price: item.sale_price,
                            num: 1,
                            type: 2,
                            name: item.featured_name
                        };
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
                    };
                    goodsOfWash.push(goods);
                    this.setData({
                        'orderForm.num': this.data.orderForm.num + 1,
                        'washGoodsOrder.money': add(this.data.washGoodsOrder.moneyitem.sale_price),
                        'washGoodsOrder.goods': goodsOfWash,
                        'orderForm.is_queue': goods.is_queue,
                        'washGoodsOrder.is_queue': goods.is_queue
                    });
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
                        };
                        if (goods.is_queue && service.length > 0) {
                            goodsOfWash.push(goods);
                            this.setData({
                                'orderForm.is_queue': true,
                                'orderForm.num': this.data.orderForm.num + 1,
                                'washGoodsOrder.goods': goodsOfWash,
                                'washGoodsOrder.money': add(this.data.washGoodsOrder.moneyitem.sale_price)
                            });
                        } else {
                            goodsOfService.push(goods);
                            this.setData({
                                'orderForm.num': this.data.orderForm.num + 1,
                                'serviceGoodsOrder.goods': goodsOfService,
                                'serviceGoodsOrder.money': add(this.data.serviceGoodsOrder.moneyitem.sale_price)
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
                    order.push(this.data.washGoodsOrder);
                }
                if (this.data.serviceGoodsOrder.goods.length > 0) {
                    order.push(this.data.serviceGoodsOrder);
                }
                if (this.data.packageOrder.goods.length > 0) {
                    order.push(this.data.packageOrder);
                }
                this.setData({
                    'orderForm.order': order,
                    'orderForm.money': this.data.money
                });
                this.gotoPay();
            }, 500);
        }
    },
    /**
     * 排队前的验证
     */
    onAddQueue: function() {
        if (this.data.form.arrive_pay === 'Y') {
            let order = [
                {
                    money: this.data.form.money,
                    category: 0,
                    content: '',
                    notice: '',
                    is_queue: true,
                    goods: [
                        {
                            id: this.data.form.goods_id,
                            price: this.data.form.money,
                            num: 1,
                            type: 0,
                            service_item: this.data.form.service_item,
                            station_type: this.data.form.station_type,
                            name: this.data.form.goods_name,
                            is_queue: true
                        }
                    ]
                }
            ];
            this.setData({
                'orderForm.order': order,
                'orderForm.first_pay': 0
            });
            this.gotoPay();
        } else {
            this.addQueue();
        }
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
            let index = this.data.carNumbers.findIndex(value => carNumber === value);
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
    onShow: function() {
        if (this.data.tabIndex == 0) {
            this.getServices();
        } else {
            this.getGoods();
        }
    },
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
});
