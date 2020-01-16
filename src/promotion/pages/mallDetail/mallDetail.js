import api from '../../../utils/api';
import { showLoading, toastMsg } from '../../../utils/util';
import { host } from '../../../config';
import WxParse from '../../../assets/plugins/wxParse/wxParse';
Page({
    data: {
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        storeForm: {
            merchant_id: 0,
            goods_id: 0,
            page: 1
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
        keyboardVisible: false
    },
    homes: function() {
        wx.switchTab({
            url: '../../../pages/index/index'
        });
    },
    hideKeyboard: function() {
        this.setData({
            keyboardVisible: false
        });
    },
    //立即购买
    buyNow: function() {
        this.setData({
            keyboardVisible: true
        });
        // let obj = {
        //     goods_id: element.goods_id,
        //     num: element.num
        // };
        // wx.navigateTo({
        //     url: '../mallOrder/mallOrder'
        // });
    },
    buyTa: function(e) {
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
    //加入购物车
    addCar: function() {
        showLoading();
        api.get('/weapp/mall-cart/add-to-cart', this.data.storeForm).then(res => {
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
    getStoreInfo: function() {
        showLoading();
        api.get('/weapp/mall-goods/get-goods-detail', this.data.storeForm, false)
            .then(res => {
                wx.hideLoading();
                if (res.errcode == 0) {
                    this.setData({
                        goodImg: res.data.goods_img,
                        goodInfo: res.data.goods_detail,
                        comment: this.data.comment.concat(res.data.comment),
                        'goodInfo.goods_id': res.data.goods_id,
                        keyboardVisible: false
                    });
                    WxParse.wxParse('detail', 'html', res.data.goods_detail.contents, this, 15);
                    let hasMore = res.errcode !== 0 || this.data.page >= res.data.last_page ? false : true;
                    this.setData({
                        loadMoreVisible: false,
                        loadingVisible: false,
                        hasMore: hasMore,
                        hasData: this.data.comment.length === 0 ? false : true
                    });
                    return;
                }
                wx.hideLoading();
                toastMsg(res.errmsg, 'error', 1000, () => {
                    wx.navigateBack({
                        delta: 1
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
    onLoad: function(options) {
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        this.setData({
            'storeForm.merchant_id': bmsWeappStoreInfo.merchant_id,
            'storeForm.goods_id': options.goods_id
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.getStoreInfo();
    },
    /**
     * 切换视图
     */
    changView: function(e) {
        let index = e.target.dataset.index;
        if (index == this.data.activeIndex) {
            return;
        }
        this.setData({
            activeIndex: index
        });
    },
    loadMore: function() {}
});
