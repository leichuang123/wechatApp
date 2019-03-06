import { get } from '../../utils/api';
const app = getApp();
const sliderWidth = 72; // 需要设置slider的宽度，用于计算中间位置
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        hasMore: true,
        loadMoreVisible: false,
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        sliderWidth: sliderWidth,
        goods: [],
        tabs: [
            {
                id: '',
                name: '全部'
            },
            {
                id: 'goods',
                name: '商品'
            },
            {
                id: 'package',
                name: '计次卡'
            },
            {
                id: 'stored_value_card',
                name: '储值卡'
            }
        ],
        form: {
            promotion_source: '',
            longitude: '',
            latitude: '',
            area_code: '',
            page: 1
        }
    },
    /**
     * 获取商品列表
     */
    getGoods: function() {
        this.setData({
            loadingVisible: true
        });
        get('weapp/promotion-list', this.data.form, false).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    goods: this.data.goods.concat(res.data.data)
                });
            }
            let hasMore = res.errcode !== 0 || this.data.form.page >= res.data.last_page ? false : true;
            this.setData({
                loadingVisible: false,
                hasData: this.data.goods.length > 0 ? true : false,
                loadMoreVisible: false,
                hasMore: hasMore
            });
        });
    },
    /**
     * 跳转到店内促销详情页
     */
    gotoStorePromotion: function(e) {
        const item = e.currentTarget.dataset.item;
        const params = JSON.stringify({
            merchant_id: item.merchant_id,
            store_id: item.store_id,
            latitude: this.data.form.latitude,
            longitude: this.data.form.longitude
        });
        wx.navigateTo({
            url: '../../promotion/pages/store-goods/index?params=' + params
        });
    },
    /**
     * 跳转到商品详情页
     */
    gotoGoodsDetail: function(e) {
        const goods = e.currentTarget.dataset.item;
        const params = JSON.stringify({
            id: goods.id,
            store_id: goods.store_id,
            merchant_id: goods.merchant_id,
        });
        wx.navigateTo({
            url: '../../promotion/pages/goods-detail/index?params=' + params
        });
    },
    /**
     * 切换tab
     */
    tabClick: function(e) {
        const index = e.currentTarget.id;
        const currentCate = this.data.tabs[index].id;
        if (currentCate == this.data.form.promotion_source) {
            return;
        }
        this.setData({
            'form.promotion_source': currentCate,
            'form.page': 1,
            goods: [],
            hasData: true,
            hasMore: true,
            loadMoreVisible: false,
            activeIndex: index,
            sliderOffset: e.currentTarget.offsetLeft
        });
        this.getGoods();
    },
    /**
     * 跳转到支付页面
     */
    gotoPay: function(goods) {
        const params = JSON.stringify({
            goods_id: goods.related_id,
            money: goods.promotion_price,
            merchant_id: goods.merchant_id,
            store_id: goods.store_id,
            store_name: goods.store_name,
            goods_name: goods.related_name,
            category: goods.category
        });
        wx.navigateTo({ url: '../../promotion/pages/payment/payment?params=' + params });
    },
    /**
     * 跳转到注册页面
     */
    gotoRegister: function() {
        wx.navigateTo({
            url: '/pages/register/register'
        });
    },
    onGotoPay: function(e) {
        const userData = wx.getStorageSync('userData');
        if (!!userData && userData.registered) {
            this.gotoPay(e.currentTarget.dataset.item);
        } else {
            this.gotoRegister();
        }
    },
    initData: function() {
        let locationInfo = wx.getStorageSync('locationInfo');
        let selectedCity = wx.getStorageSync('selectedCity');
        console.log([locationInfo, selectedCity]);
        if (!locationInfo && selectedCity) {
            locationInfo = app.globalData.defaultLocation;
        }
        this.setData({
            'form.latitude': locationInfo.latitude,
            'form.longitude': locationInfo.longitude,
            'form.area_code': !!selectedCity ? selectedCity.code: locationInfo.adcode,
            sliderLeft: (app.globalData.windowWidth / this.data.tabs.length - sliderWidth) / 2,
            sliderOffset: (app.globalData.windowWidth / this.data.tabs.length) * this.data.activeIndex
        });
        this.getGoods();
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // this.initData();
    },
    onShow:function(){
        this.initData();
    },
    /**
     * 加载更多
     */
    onReachBottom: function() {
        if (!this.data.hasMore) {
            return;
        }
        this.setData({
            loadMoreVisible: true,
            'form.page': this.data.page + 1
        });
        this.getGoods();
    }
});
