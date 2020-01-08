import api from '../../../utils/api';
import { toastMsg, showLoading } from '../../../utils/util';
Page({
    data: {
        items: [
            {
                stored_id: 0,
                stored_name: '测试',
                stored_abstract: '',
                stored_sale: 0.0,
                stored_give: 0.0,
                stored_amount: 0.0,
                shortage: true,
                can_buy: false
            }
        ],
        selectId: 0,
        allMoney: 0.0,
        number: 0,
        merchant_id: 0,
        page: 1,
        loadingVisible: false, //加载中
        hasData: true,
        hasMore: true,
        loadMoreVisible: false, //加载更多
        totalPage: 0
    },
    onLoad: function(options) {
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        this.setData({
            merchant_id: bmsWeappStoreInfo.merchant_id
        });
    },
    onShow: function() {
        this.getVipList(true);
    },
    getVipList: function(type = false) {
        //showLoading();
        api.get('mall/get-vip-card-lists', { merchant_id: this.data.merchant_id, page: this.data.page }).then(res => {
            wx.hideLoading();
            if (res.errcode == 0) {
                let hasMore = res.errcode !== 0 || this.data.page >= res.data.last_page ? false : true;
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
        });
    },
    choosse(e) {
        if (e.currentTarget.dataset.item.shortage) {
            toastMsg('商品缺货中', 'error');
            return;
        }
        if (!e.currentTarget.dataset.item.can_buy) {
            toastMsg('该卡暂时不能购买', 'error');
            return;
        }
        this.setData({
            selectId: e.currentTarget.dataset.item.stored_id,
            number: 1,
            allMoney: e.currentTarget.dataset.item.stored_sale
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
    }
});
