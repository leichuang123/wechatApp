import api from '../../utils/api';
import { host } from '../../config';
import { showLoading, toastMsg } from '../../utils/util';
import { getLocation } from '../../utils/wx-api';
Page({
    data: {
        city: '',
        loadingVisible: false, //加载中
        hasData: true,
        hasMore: true,
        loadMoreVisible: false, //加载更多
        recommendList: [
            {
                goods_id: 0,
                goods_name: '万祥马牌机油全合成正品汽车5W-30汽油发动机润滑油 SN四季通用4L',
                sale_price: '￥88',
                inventory: 0,
                already_num: 0.0,
                shortage: false,
                goods_img: '/images/weapp/testImg/jiyou.jpg',
                source: 'self',
            },
            {
                goods_id: 0,
                goods_name: '米其林City grip/2ct半热熔摩托车轮胎裂行佳御UYN1电动车9090-12',
                sale_price: '￥280',
                inventory: 0,
                already_num: 0.0,
                shortage: false,
                goods_img: '/images/weapp/testImg/luntai.jpg',
                source: 'self',
            },
            {
                goods_id: 0,
                goods_name: '途星犬汽车gps定位器车载OBD定位器卫星跟踪仪小型车辆防盗免安装',
                sale_price: '￥229',
                inventory: 0,
                already_num: 0.0,
                shortage: false,
                goods_img: '/images/weapp/testImg/gps.jpg',
                source: 'self',
            },
        ],
        host: host,
        type: [],
        goodList: [
            {
                goods_id: 0,
                goods_name: '万祥马牌机油全合成正品汽车5W-30汽油发动机润滑油 SN四季通用4L',
                sale_price: '￥88',
                inventory: 0,
                already_num: 0.0,
                shortage: false,
                goods_img: '/images/weapp/testImg/jiyou.jpg',
                source: 'self',
            },
            {
                goods_id: 0,
                goods_name: '米其林City grip/2ct半热熔摩托车轮胎裂行佳御UYN1电动车9090-12',
                sale_price: '￥280',
                inventory: 0,
                already_num: 0.0,
                shortage: false,
                goods_img: '/images/weapp/testImg/luntai.jpg',
                source: 'self',
            },
            {
                goods_id: 0,
                goods_name: '途星犬汽车gps定位器车载OBD定位器卫星跟踪仪小型车辆防盗免安装',
                sale_price: '￥229',
                inventory: 0,
                already_num: 0.0,
                shortage: false,
                goods_img: '/images/weapp/testImg/gps.jpg',
                source: 'self',
            },
        ],
        merchant_id: 0,
        first_class_id: '',
        totalPage: 0,
        page: 1,
        keyboardVisible: false,
        bugInfo: {},
        isTop: false,
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        weappList: [],
    },
    //获取banner
    getBannerList: function (merchant_id) {
        let params = {
            merchant_id: merchant_id,
            position: 'mall',
        };
        api.get('/weapp/ad/get-weapp-list', params, false).then((res) => {
            if (res.errcode == 0) {
                this.setData({
                    weappList: res.data,
                });
            }
        });
    },
    //点击banner跳转商品详情
    clickPic: function (row) {
        if (!row.currentTarget.dataset.item.jump_goods_page) {
            return;
        }
        wx.navigateTo({
            url:
                '../../promotion/pages/mallDetail/mallDetail?goods_id=' +
                row.currentTarget.dataset.item.goods_id +
                '&type=' +
                e.currentTarget.dataset.item.type,
        });
    },
    /**
     * 定位
     */
    getLocation: function () {
        getLocation({
            type: 'wgs84',
        })
            .then((res) => {
                let locationInfo = {
                    latitude: res.latitude,
                    longitude: res.longitude,
                };
                this.getLocationInfo(locationInfo);
            })
            .catch((res) => {
                let me = this;
                wx.showModal({
                    content: '请您开启手机GPS定位',
                    confirmText: '我已开启',
                    confirmColor: '#e60103',
                    success(res) {
                        if (res.confirm) {
                            wx.reLaunch({
                                url: '/pages/store/store',
                            });
                        } else if (res.cancel) {
                            me.getLocationInfo();
                        }
                    },
                });
            });
    },
    getLocationInfo: function (locationInfo) {
        showLoading();
        api.get('weapp/getcityinfo', locationInfo, false).then((res) => {
            wx.hideLoading();
            if (res.errcode === 0) {
                if (locationInfo) {
                    const selectedCity = wx.getStorageSync('selectedCity');
                    const locatedCity = res.data.ad_info.city;
                    if (locatedCity !== selectedCity.name) {
                        const content = '您当前的位置为' + locatedCity + '，是否切换到当前城市';
                        confirmMsg(
                            '',
                            content,
                            true,
                            () => {
                                this.setData({
                                    city: locatedCity,
                                });
                                wx.setStorageSync('selectedCity', {
                                    name: locatedCity,
                                    code: locationInfo.city_code,
                                });
                            },
                            () => {
                                this.setData({
                                    city: !selectedCity ? '请选择' : selectedCity.name,
                                });
                            }
                        );
                    }
                    locationInfo.adcode = res.data.ad_info.adcode;
                    locationInfo.city_code = res.data.ad_info.city_code.substring(res.data.ad_info.nation_code.length);
                    locationInfo.city = res.data.ad_info.city;
                    locationInfo.district = res.data.ad_info.district;
                    wx.setStorageSync('locationInfo', locationInfo);
                }
                //储存定位获取的最近的门店信息
                let bmsWeappStoreInfo = res.data.store_info;
                this.setData({
                    merchant_id: bmsWeappStoreInfo.merchant_id,
                });
                wx.setStorageSync('bmsWeappStoreInfo', bmsWeappStoreInfo);
                this.getType();
                this.getRecommend();
                this.getGoodList(true);
            } else {
                confirmMsg('', res.errmsg, false, () => {
                    wx.reLaunch({
                        url: '/pages/index/index',
                    });
                });
            }
        });
    },
    onLoad: function (options) {
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        if (!bmsWeappStoreInfo) {
            this.getLocation();
            return;
        }
        this.setData({
            merchant_id: bmsWeappStoreInfo.merchant_id,
        });
        this.getType();
        this.getRecommend();
        this.getGoodList(true);
        this.getBannerList(bmsWeappStoreInfo.merchant_id);
    },
    onShow: function () {
        wx.showTabBar();
        this.setData({
            keyboardVisible: false,
        });
    },

    onPageScroll: function (res) {
        if (res.scrollTop > 460) {
            this.setData({
                isTop: true,
            });
        } else {
            this.setData({
                isTop: false,
            });
        }
    },

    typeChange: function (e) {
        if (e.currentTarget.dataset.item.goods_class_id == this.data.first_class_id) {
            return;
        }
        this.setData({
            first_class_id: e.currentTarget.dataset.item.goods_class_id,
            page: 1,
        });
        this.getGoodList(true);
    },
    seeDetail(e) {
        if (!e.currentTarget.dataset.item.goods_id) {
            toastMsg('商品下架了', 'error');
            return;
        }
        wx.navigateTo({
            url:
                '../../promotion/pages/mallDetail/mallDetail?goods_id=' +
                e.currentTarget.dataset.item.goods_id +
                '&type=' +
                e.currentTarget.dataset.item.type,
        });
    },
    listBuy(e) {
        wx.hideTabBar();
        let data = e.currentTarget.dataset.item;
        if (data.source == 'self') {
            data.goods_img = host + data.goods_img;
        }

        this.setData({
            bugInfo: data,
            keyboardVisible: true,
        });
    },
    hideKeyboard: function () {
        wx.showTabBar();
        this.setData({
            keyboardVisible: false,
        });
    },
    buyNow: function (e) {
        let params = {
            goods_id: e.detail.result.goods_id,
            num: e.detail.result.num,
        };
        let goods_list = [];
        goods_list.push(params);
        wx.navigateTo({
            url: '../../promotion/pages/mallOrder/mallOrder?goods_list=' + JSON.stringify(goods_list),
        });
    },
    //获取商品全部分类
    getType: function () {
        api.get('/weapp/mall-goods/get-goods-class-list', { merchant_id: this.data.merchant_id }).then((res) => {
            if (res.errcode == 0) {
                let type = res.data;
                type.unshift({ goods_class_name: '全部', goods_class_id: '' });
                this.setData({
                    type: type,
                });
            }
        });
    },
    //获取商品
    getGoodList: function (type = false) {
        api.get('/weapp/mall-goods/get-goods-list', {
            merchant_id: this.data.merchant_id,
            first_class_id: this.data.first_class_id,
            page: this.data.page,
        })
            .then((res) => {
                wx.hideLoading();
                if (res.errcode == 0) {
                    let hasMore = res.errcode !== 0 || this.data.page >= res.data.last_page ? false : true;
                    this.setData({
                        loadMoreVisible: false,
                        loadingVisible: false,
                        hasMore: hasMore,
                        hasData: this.data.goodList.length === 0 ? false : true,
                    });
                    if (type) {
                        this.setData({
                            goodList: res.data.data,
                            totalPage: res.data.last_page,
                        });
                        return;
                    }
                    this.setData({
                        goodList: this.data.goodList.concat(res.data.data),
                        totalPage: res.data.last_page,
                    });
                }
            })
            .catch(() => {
                wx.hideLoading();
            });
    },
    //获取部分推荐商品
    getRecommend: function () {
        showLoading();
        let params = {
            merchant_id: this.data.merchant_id,
            type: 'part',
        };
        api.get('/weapp/mall-goods/get-recommend-lists', params, false)
            .then((res) => {
                wx.hideLoading();
                if (res.errcode === 0) {
                    this.setData({
                        recommendList: res.data,
                    });
                }
            })
            .catch(() => {
                wx.hideLoading();
            });
    },
    //查看购物车
    goToCar() {
        wx.navigateTo({
            url: '../../promotion/pages/mallCar/mallCar',
        });
    },
    //查看更多推荐商品
    seeMore() {
        wx.navigateTo({
            url: '../../promotion/pages/recommendList/recommendList',
        });
    },
    /**
     * 下拉刷新
     */
    onPullDownRefresh: function () {
        this.setData({
            loadingVisible: true,
            loadMoreVisible: false,
            hasData: true,
            hasMore: true,
            page: 1,
            first_class_id: '',
            goodList: [],
        });
        this.getType();
        this.getRecommend();
        this.getGoodList(true);
        this.getBannerList(this.data.merchant_id);
    },
    /**
     * 下拉加载更多
     */
    onReachBottom: function () {
        if (!this.data.hasMore || this.data.page >= this.data.totalPage) {
            return;
        }
        this.setData({
            loadMoreVisible: true,
            page: this.data.page + 1,
        });
        this.getGoodList();
    },
});
