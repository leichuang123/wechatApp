import api from '../../../utils/api';
import { showLoading, toastMsg } from '../../../utils/util';
import { host } from '../../../config';
Page({
    data: {
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
        host: host,
        keyboardVisible: false,
        bugInfo: {},
        num: 1
    },
    onLoad: function(options) {
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        this.setData({
            merchant_id: bmsWeappStoreInfo.merchant_id
        });
    },
    onShow: function() {
        this.getRecommend();
    },
    bug(e) {
        let data = e.currentTarget.dataset.item;
        if (data.source == 'self') {
            data.goods_img = host + data.goods_img;
        }

        this.setData({
            bugInfo: data,
            keyboardVisible: true
        });
    },
    //立即购买
    buyNow: function(e) {
        let params = {
            goods_id: e.detail.result.goods_id,
            num: e.detail.result.num
        };
        let goods_list = [];
        goods_list.push(params);
        wx.navigateTo({
            url: '../mallOrder/mallOrder?goods_list=' + JSON.stringify(goods_list)
        });
    },
    hideKeyboard: function() {
        wx.showTabBar();
        this.setData({
            keyboardVisible: false
        });
    },
    seeDetail(e) {
        if (!e.currentTarget.dataset.item.goods_id) {
            toastMsg('商品下架了', 'error');
            return;
        }
        wx.navigateTo({
            url: '../mallDetail/mallDetail?goods_id=' + e.currentTarget.dataset.item.goods_id
        });
    },
    /**
     * 获取全部推荐商品
     */
    getRecommend: function() {
        showLoading();
        let params = {
            merchant_id: this.data.merchant_id,
            type: 'all'
        };
        api.get('mall-goods/get-recommend-list', params, false)
            .then(res => {
                wx.hideLoading();
                if (res.errcode === 0) {
                    this.setData({
                        goodList: res.data,
                        keyboardVisible: false
                    });
                }
            })
            .catch(() => {
                wx.hideLoading();
            });
    }
});
