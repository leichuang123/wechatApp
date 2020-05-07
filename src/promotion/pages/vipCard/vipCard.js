import api from '../../../utils/api';
import { toastMsg, showLoading, confirmMsg } from '../../../utils/util';
import wxPay from '../../../utils/requestPayment';
Page({
    data: {
        items: [],
        selectId: 0,
        allMoney: 0.0,
        number: 0,
        merchant_id: 0,
        store_id: 0,
        page: 1,
        loadingVisible: false, //加载中
        hasData: true,
        hasMore: true,
        loadMoreVisible: false, //加载更多
        totalPage: 0,
        isbuy:true,
        sMoney:null
    },
    onLoad: function(options) {
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        this.setData({
            merchant_id: bmsWeappStoreInfo.merchant_id,
            store_id: bmsWeappStoreInfo.store_id
        });
    },
    onShow: function() {
        this.getVipList(true);
    },
    getVipList: function(type = false) {
        showLoading();
        api.get('/weapp/mall/get-vip-card-list', { merchant_id: this.data.merchant_id, page: this.data.page }).then(
            res => {
                wx.hideLoading();
                if (res.errcode == 0) {
                    let hasMore = res.errcode != 0 || this.data.page >= res.data.last_page ? false : true;
                    this.setData({
                        loadMoreVisible: false,
                        loadingVisible: false,
                        hasMore: hasMore,
                        hasData: this.data.items.length === 0 ? false : true
                    });
                    if (type) {
                        this.setData({
                            items: res.data.data,
                            totalPage: res.data.last_page
                        });
                        return;
                    }
                    this.setData({
                        items: this.data.items.concat(res.data.data),
                        totalPage: res.data.last_page
                    });
                }
            }
        );
    },
    choosse(e) {
        if (e.currentTarget.dataset.item.shortage) {
            toastMsg('商品缺货中', 'error');
            return;
        }
        // if (!e.currentTarget.dataset.item.can_buy) {
        //     confirmMsg('', '您已经有vip卡了，将会给vip卡充值', true, () => {
        //         this.setData({
        //             selectId: e.currentTarget.dataset.item.vip_card_id,
        //             number: 1,
        //             allMoney: e.currentTarget.dataset.item.stored_sale
        //         });
        //     },()=>{
        //         this.setData({
        //             selectId:0,
        //             number: 0,
        //             allMoney: 0.00
        //         });
        //     })        
        // }
        this.setData({
            isbuy:e.currentTarget.dataset.item.can_buy,
            selectId: e.currentTarget.dataset.item.vip_card_id,
            number: 1,
            allMoney: e.currentTarget.dataset.item.stored_sale,
            sMoney:e.currentTarget.dataset.item.stored_amount
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
        this.getVipList();
    },
    sumit: function() {
        if (!this.data.selectId) {
            toastMsg('请选择VIP卡', 'error');
            return;
        }
        confirmMsg('', '确定结算？', true, () => {
            showLoading();
            let param = {
                merchant_id: this.data.merchant_id,
                store_id: this.data.store_id,
                vip_card_id: this.data.selectId
            };
            api.post('/weapp/mall/buy-vip-card', param)
                .then(res => {
                    wx.hideLoading();
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
                                    url: '/pages/payment/success'
                                });
                            });
                        },
                        () => {
                            toastMsg('支付失败', 'error', 1000, () => {
                                wx.navigateBack({
                                    delta: 2
                                });
                            });
                        }
                    );
                })
                .catch(() => {
                    wx.hideLoading();
                });
        });
    }
});
