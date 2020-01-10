import api from '../../../utils/api';
import { toastMsg, showLoading } from '../../../utils/util';
import { add, subtract } from '../../../utils/calculate';
Page({
    data: {
        items: [],
        select: [],
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
        this.getPackList(true);
    },
    getPackList: function(type = false) {
        showLoading();
        api.get('/weapp/mall/get-package-card-list', { merchant_id: this.data.merchant_id, page: this.data.page }).then(
            res => {
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
            }
        );
    },
    choosse(e) {
        if (e.currentTarget.dataset.item.shortage) {
            toastMsg('套餐缺货中', 'error');
            return;
        }
        let select = this.data.select;
        let item = this.data.items;
        let index = e.currentTarget.dataset.index;
        let reulstIndex = select.indexOf(e.currentTarget.dataset.item.package_id);
        let money = 0;
        if (reulstIndex !== -1) {
            select.splice(reulstIndex, 1);
            item[index].checked = false;
            money = subtract(this.data.allMoney, item[index].sale_price);
        } else {
            item[index].checked = true;
            select.push(e.currentTarget.dataset.item.package_id);
            money = add(this.data.allMoney, item[index].sale_price);
        }
        this.setData({
            select: select,
            items: item,
            number: select.length,
            allMoney: money
        });
    }
});
