import { getRequest } from '../../../utils/api';
import { openLocation } from '../../../utils/wx-api';
const app = getApp();
Page({
    data: {
        loadingVisible: false,
        hasData: true,
        hasMore: true,
        loadMoreVisible: false,
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        goods: [],
        tabs: [
            { id: '', name: '全部' },
            { id: 'goods', name: '商品' },
            { id: 'package', name: '计次卡' },
            { id: 'stored_value_card', name: '储值卡' }
        ],
        form: {
            promotion_source: '',
            merchant_id: 0,
            store_id: 0,
            page: 1
        },
        storeForm: {
            store_id: 0,
            longitude: '',
            latitude: ''
        },
        goodsForm: {
            goods_id: 0,
            money: 0,
            merchant_id: 0,
            store_id: 0,
            store_name: '',
            category: 0,
            goods_name: ''
        },
        storeDetail: {}
    },
    /**
     * 获取门店详情
     */
    getStoreDetail: function () {
        getRequest('weapp/promotion-store-detail', this.data.storeForm, false).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    storeDetail: res.data
                });
                return;
            }
            this.setData({
                storeDetail: {}
            });
        });
    },
    /**
     * 获取商品列表
     */
    getPromotionList: function () {
        this.setData({ loadingVisible: true });
        getRequest('weapp/store-promotion-list', this.data.form, false).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    goods: this.data.goods.concat(res.data.data)
                });
            }
            let hasMore = (res.errcode !== 0 || this.data.form.page >= res.data.last_page) ? false : true;
            this.setData({
                loadingVisible: false,
                hasData: this.data.goods.length > 0 ? true : false,
                loadMoreVisible: false,
                hasMore: hasMore
            });
        });
    },
    /**
     * 跳转到商品详情页
     */
    gotoGoodsDetail: function (e) {
        let goods = e.currentTarget.dataset.item;
        let params = JSON.stringify({
            id: goods.id,
            store_id: goods.store_id,
            merchant_id: goods.merchant_id
        });
        wx.navigateTo({
            url: '../goods-detail/index?params=' + params
        });
    },
    /**
     * 获取位置信息
     */
    getLocation: function () {
        app.getLocation(res => {
            this.setData({
                'storeForm.latitude': res.latitude,
                'storeForm.longitude': res.longitude
            });
            this.getStoreDetail();
            this.getPromotionList();
        });
    },
    /**
     * 加载更多
     */
    loadMore: function () {
        if (!this.data.hasMore) {
            return;
        }
        this.setData({
            loadMoreVisible: true,
            'form.page': this.data.form.page + 1
        });
        this.getPromotionList();
    },
    /**
     * 切换tab
     */
    switchTab: function (e) {
        if (e.currentTarget.id === this.data.form.promotion_source) {
            return;
        }
        this.setData({
            'form.promotion_source': e.currentTarget.id,
            'form.page': 1,
            goods: [],
            hasData: true,
            hasMore: true,
            loadMoreVisible: false
        });
        this.getPromotionList();
    },
    /**
     * 定位
     */
    openLocation: function () {
        let store = this.data.storeDetail,
            latitude = parseFloat(store.store_lati),
            longitude = parseFloat(store.store_long);

        let params = {
            latitude: latitude,
            longitude: longitude,
            scale: 18,
            name: store.store_name,
            address: store.store_address
        };
        openLocation(params);
    },
    /**
     * 跳转到支付页面
     */
    gotoPay: function (e) {
        let item = e.currentTarget.dataset.item;
        this.setData({
            'goodsForm.goods_id': item.related_id,
            'goodsForm.money': item.promotion_price,
            'goodsForm.merchant_id': item.merchant_id,
            'goodsForm.store_id': item.store_id,
            'goodsForm.store_name': this.data.storeDetail.store_name,
            'goodsForm.goods_name': item.related_name,
            'goodsForm.category': item.category
        });
        wx.navigateTo({
            url: '../payment/payment?params=' + JSON.stringify(this.data.goodsForm)
        });
    },
    /**
     * 跳转到注册页面
     */
    gotoRegister: function () {
        wx.navigateTo({
            url: '../../../pages/register/register'
        });
    },
    onGotoPay: function (e) {
        let item = e.currentTarget.dataset.item;
        let userData = wx.getStorageSync('userData');
        if (!!userData && userData.isRegist) {
            this.gotoPay(item);
        } else {
            this.gotoRegister();
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let params = JSON.parse(options.params);
        this.setData({
            'form.merchant_id': params.merchant_id,
            'form.store_id': params.store_id,
            'storeForm.store_id': params.store_id
        });
        this.getLocation();
    }
});
