import api from '../../utils/api';
import { host } from '../../config';
import { showLoading, toastMsg } from '../../utils/util';
Page({
    data: {
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
                goods_img: '/images/weapp/testImg/jiyou.jpg'
            },
            {
                goods_id: 0,
                goods_name: '米其林City grip/2ct半热熔摩托车轮胎裂行佳御UYN1电动车9090-12',
                sale_price: '￥280',
                inventory: 0,
                already_num: 0.0,
                shortage: false,
                goods_img: '/images/weapp/testImg/luntai.jpg'
            },
            {
                goods_id: 0,
                goods_name: '途星犬汽车gps定位器车载OBD定位器卫星跟踪仪小型车辆防盗免安装',
                sale_price: '￥229',
                inventory: 0,
                already_num: 0.0,
                shortage: false,
                goods_img: '/images/weapp/testImg/gps.jpg'
            }
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
                goods_img: '/images/weapp/testImg/jiyou.jpg'
            },
            {
                goods_id: 0,
                goods_name: '米其林City grip/2ct半热熔摩托车轮胎裂行佳御UYN1电动车9090-12',
                sale_price: '￥280',
                inventory: 0,
                already_num: 0.0,
                shortage: false,
                goods_img: '/images/weapp/testImg/luntai.jpg'
            },
            {
                goods_id: 0,
                goods_name: '途星犬汽车gps定位器车载OBD定位器卫星跟踪仪小型车辆防盗免安装',
                sale_price: '￥229',
                inventory: 0,
                already_num: 0.0,
                shortage: false,
                goods_img: '/images/weapp/testImg/gps.jpg'
            }
        ],
        merchant_id: 0,
        first_class_id: '',
        totalPage: 0,
        page: 1,
        keyboardVisible: false,
        bugInfo: {}
    },
    onLoad: function(options) {
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        this.setData({
            merchant_id: bmsWeappStoreInfo.merchant_id
        });
        this.getType();
    },
    onShow: function() {
        this.setData({
            goodList: []
        });
        this.getRecommend();
        this.getGoodList(true);
    },
    typeChange: function(e) {
        if (e.currentTarget.dataset.item.goods_class_id == this.data.first_class_id) {
            return;
        }
        this.setData({
            first_class_id: e.currentTarget.dataset.item.goods_class_id,
            page: 1
        });
        this.getGoodList(true);
    },
    seeDetail(e) {
        if (!e.currentTarget.dataset.item.goods_id) {
            toastMsg('商品下架了', 'error');
            return;
        }
        wx.navigateTo({
            url: '../../promotion/pages/mallDetail/mallDetail?goods_id=' + e.currentTarget.dataset.item.goods_id
        });
    },
    bug(e) {
        wx.hideTabBar();
        this.setData({
            keyboardVisible: true,
            bugInfo: e.currentTarget.dataset.item
        });
    },
    hideKeyboard: function() {
        wx.showTabBar();
        this.setData({
            keyboardVisible: false
        });
    },
    //获取商品全部分类
    getType: function() {
        api.get('/weapp/mall-goods/get-goods-class-list', { merchant_id: this.data.merchant_id }).then(res => {
            if (res.errcode == 0) {
                let type = res.data;
                type.unshift({ goods_class_name: '全部', goods_class_id: '' });
                this.setData({
                    type: type
                });
            }
        });
    },
    //获取商品
    getGoodList: function(type = false) {
        api.get('/weapp/mall-goods/get-goods-list', {
            merchant_id: this.data.merchant_id,
            first_class_id: this.data.first_class_id,
            page: this.data.page
        })
            .then(res => {
                wx.hideLoading();
                if (res.errcode == 0) {
                    let hasMore = res.errcode !== 0 || this.data.page >= res.data.last_page ? false : true;
                    this.setData({
                        loadMoreVisible: false,
                        loadingVisible: false,
                        hasMore: hasMore,
                        hasData: this.data.goodList.length === 0 ? false : true
                    });
                    if (type) {
                        this.setData({
                            goodList: res.data.data,
                            totalPage: res.data.last_page
                        });
                        return;
                    }
                    this.setData({
                        goodList: this.data.goodList.concat(res.data.data),
                        totalPage: res.data.last_page
                    });
                }
            })
            .catch(() => {
                wx.hideLoading();
            });
    },
    //获取部分推荐商品
    getRecommend: function() {
        showLoading();
        let params = {
            merchant_id: this.data.merchant_id,
            type: 'part'
        };
        api.get('/weapp/mall-goods/get-recommend-lists', params, false)
            .then(res => {
                wx.hideLoading();
                if (res.errcode === 0) {
                    this.setData({
                        recommendList: res.data
                    });
                }
            })
            .catch(() => {
                wx.hideLoading();
            });
    },
    //查看更多推荐商品
    seeMore() {
        wx.navigateTo({
            url: '../../promotion/pages/recommendList/recommendList'
        });
    },
    /**
     * 下拉加载更多
     */
    onReachBottom: function() {
        if (!this.data.hasMore || this.data.page >= this.data.totalPage) {
            return;
        }
        this.setData({
            loadMoreVisible: true,
            page: this.data.page + 1
        });
        this.getGoodList();
    }
});
