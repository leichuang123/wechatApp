import api from '../../../utils/api';
import { toastMsg, showLoading, confirmMsg } from '../../../utils/util';
import { add, subtract } from '../../../utils/calculate';
import wxPay from '../../../utils/requestPayment';
Page({
    data: {
        items: [],
        select: [],
        allMoney: 0.0,
        number: 0,
        merchant_id: 0,
        store_id: 0,
        boxHeight: 0,
        itemArr: [],
        class_id: '',
        page: 1,
        loadingVisible: false, //加载中
        hasData: true,
        hasMore: true,
        loadMoreVisible: false, //加载更多
        totalPage: 0,
    },
    onLoad: function (options) {
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        let systemInfo = wx.getStorageSync('systemInfo');
        this.setData({
            merchant_id: bmsWeappStoreInfo.merchant_id,
            store_id: bmsWeappStoreInfo.store_id,
            boxHeight: systemInfo.windowHeight,
        });
    },
    onShow: function () {
        this.getType();
        this.getServeItem(true);
    },
    formatData(data) {
        let compareData = this.data.select;
        data.forEach((element) => {
            if (compareData.indexOf(element.goods_id) > -1) {
                element.checked = true;
            }
        });
        return data;
    },
    //获取全部服务项目
    getServeItem: function (type = false) {
        showLoading();
        api.get('weapp/mall/get-service-item-list', {
            merchant_id: this.data.merchant_id,
            first_class_id: this.data.class_id,
            page: this.data.page,
        }).then((res) => {
            wx.hideLoading();
            if (res.errcode == 0) {
                if (type) {
                    this.setData({
                        items: this.formatData(res.data.data),
                        totalPage: res.data.last_page,
                    });
                } else {
                    this.setData({
                        items: this.data.items.concat(this.formatData(res.data.data)),
                        totalPage: res.data.last_page,
                    });
                }
            }
            let hasMore = res.errcode !== 0 || this.data.page >= res.data.last_page ? false : true;
            this.setData({
                loadMoreVisible: false,
                loadingVisible: false,
                hasMore: hasMore,
                hasData: this.data.items.length === 0 ? false : true,
            });
        });
    },
    //获取分类
    getType: function () {
        api.get('/weapp/mall/get-service-item-class-list', { merchant_id: this.data.merchant_id }).then((res) => {
            if (res.errcode == 0) {
                let type = res.data;
                type.unshift({ class_name: '全部', class_id: '' });
                this.setData({
                    itemArr: type,
                });
            }
        });
    },
    typeChange(e) {
        if (e.currentTarget.dataset.item.class_id == this.data.class_id) {
            return;
        }
        this.setData({
            class_id: e.currentTarget.dataset.item.class_id,
            page: 1,
            number: 0,
        });
        this.getServeItem(true);
    },
    choosse(e) {
        if (e.currentTarget.dataset.item.shortage) {
            toastMsg('商品缺货中', 'error');
            return;
        }
        let select = this.data.select;
        let item = this.data.items;
        let index = e.currentTarget.dataset.index;
        let reulstIndex = select.indexOf(e.currentTarget.dataset.item.goods_id);
        let money = 0;
        if (reulstIndex !== -1) {
            select.splice(reulstIndex, 1);
            item[index].checked = false;
            money = subtract(this.data.allMoney, item[index].sale_price);
        } else {
            item[index].checked = true;
            select.push(e.currentTarget.dataset.item.goods_id);
            money = add(this.data.allMoney, item[index].sale_price);
        }
        this.setData({
            select: select,
            items: item,
            number: select.length,
            allMoney: money,
        });
    },
    /**
     * 下拉加载更多
     */
    onReachBottom: function () {
        console.log(1);
        if (!this.data.hasMore || this.data.page >= this.data.totalPage) {
            return;
        }
        this.setData({
            loadMoreVisible: true,
            page: this.data.page + 1,
        });
        this.getServeItem();
    },
    buy: function () {
        if (!this.data.select.length) {
            toastMsg('请选择服务项目', 'error');
            return;
        }
        confirmMsg('', '确定结算？', true, () => {
            showLoading();
            let param = {
                merchant_id: this.data.merchant_id,
                store_id: this.data.store_id,
                service_item_ids: this.data.select,
            };
            api.post('/weapp/mall/buy-service-item', param)
                .then((res) => {
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
                })
                .catch(() => {
                    wx.hideLoading();
                });
        });
    },
});
