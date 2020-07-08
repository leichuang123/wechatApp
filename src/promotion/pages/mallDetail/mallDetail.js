import api from '../../../utils/api';
import { showLoading, toastMsg, confirmMsg } from '../../../utils/util';
import { host } from '../../../config';
import wxPay from '../../../utils/requestPayment';
import WxParse from '../../../assets/plugins/wxParse/wxParse';
Page({
    data: {
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        storeForm: {
            store_id: 0,
            merchant_id: 0,
            goods_id: 0,
            page: 1,
            type: '',
        },
        goodInfo: {},
        goodImg: [],
        host: host,
        activeIndex: 0,
        loadingVisible: false,
        hasData: true,
        hasMore: true,
        loadMoreVisible: false,
        scrollHeight: 0,
        scrollTop: 59,
        comment: [],
        keyboardVisible: false,
    },
    homes: function () {
        wx.switchTab({
            url: '../../../pages/index/index',
        });
    },
    shares: function () {},
    hideKeyboard: function () {
        this.setData({
            keyboardVisible: false,
        });
    },
    //立即购买
    buyNow: function () {
        if (this.data.goodInfo.shortage) {
            toastMsg('商品缺货中', 'error', 1200);
            return;
        }
        //联名卡直接购买一张，不使用选择商品组件
        if (this.data.goodInfo.type == 'JointlyCard') {
            this.bugJointlyCard();
            return;
        }
        this.setData({
            keyboardVisible: true,
        });
    },
    bugJointlyCard: function () {
        confirmMsg('', '确定结算？', true, () => {
            let submitParams = {
                merchant_id: this.data.storeForm.merchant_id,
                store_id: this.data.storeForm.store_id,
                jointly_card_type_id: this.data.goodInfo.goods_id,
            };
            api.post('/weapp/mall-jointly-card/place-order'.submitParams).then((res) => {
                if (res.errcode !== 0) {
                    confirmMsg('', res.errmsg, false);
                    return;
                }
                let payArgs = res.data;
                wxPay(
                    payArgs,
                    () => {
                        toastMsg('支付成功', 'success', 1000, () => {
                            wx.navigateTo({
                                url: '/pages/payment/success',
                            });
                        });
                    },
                    () => {
                        toastMsg('支付失败', 'error', 1000, () => {
                            wx.navigateBack({
                                delta: 2,
                            });
                        });
                    }
                );
            });
        }).catch(() => {});
    },
    buyTa: function (e) {
        let params = {
            goods_id: e.detail.result.goods_id,
            num: e.detail.result.num,
        };
        let goods_list = [];
        goods_list.push(params);
        wx.navigateTo({
            url: '../mallOrder/mallOrder?goods_list=' + JSON.stringify(goods_list),
        });
    },
    //加入购物车
    addCar: function () {
        if (this.data.goodInfo.type == 'JointlyCard') {
            return;
        }
        if (this.data.goodInfo.shortage) {
            toastMsg('商品缺货中', 'error', 1200);
            return;
        }
        showLoading();
        api.get('/weapp/mall-cart/add-to-cart', this.data.storeForm).then((res) => {
            wx.hideLoading();
            if (res.errcode != 0) {
                toastMsg(res.errmsg, 'error', 1000);
                return;
            }
            toastMsg('添加成功', 'success', 1000);
        });
    },
    /**
     * 获取门店详情
     */
    getStoreInfo: function () {
        showLoading();
        api.get('/weapp/mall-goods/get-goods-detail', this.data.storeForm, false)
            .then((res) => {
                wx.hideLoading();
                if (res.errcode == 0) {
                    this.setData({
                        goodImg: res.data.goods_img,
                        goodInfo: res.data.goods_detail,
                        comment: this.data.comment.concat(res.data.comment),
                        'goodInfo.goods_id': res.data.goods_id,
                        'goodInfo.goods_img':
                            res.data.goods_detail.source == 'self'
                                ? host + res.data.goods_img[0]
                                : res.data.goods_img[0],
                        keyboardVisible: false,
                    });
                    WxParse.wxParse('detail', 'html', res.data.goods_detail.contents, this, 15);
                    let hasMore = res.errcode !== 0 || this.data.page >= res.data.last_page ? false : true;
                    this.setData({
                        loadMoreVisible: false,
                        loadingVisible: false,
                        hasMore: hasMore,
                        hasData: this.data.comment.length === 0 ? false : true,
                    });
                    return;
                }
                wx.hideLoading();
                toastMsg(res.errmsg, 'error', 1000, () => {
                    wx.navigateBack({
                        delta: 1,
                    });
                });
            })
            .catch(() => {
                wx.hideLoading();
            });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        this.setData({
            'storeForm.merchant_id': bmsWeappStoreInfo.merchant_id,
            'storeForm.store_id': bmsWeappStoreInfo.store_id,
            'storeForm.goods_id': options.goods_id,
            'storeForm.type': options.type,
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.getStoreInfo();
    },
    /**
     * 切换视图
     */
    changView: function (e) {
        let index = e.target.dataset.index;
        if (index == this.data.activeIndex) {
            return;
        }
        this.setData({
            activeIndex: index,
        });
    },
    loadMore: function () {},
});
