import api from '../../utils/api.js';
import { showLoading } from '../../utils/util.js';
Page({
    data: {
        list: [],
        form: {
            merchant_id: 0,
            store_id: 0
        }
    },
    getList: function(params) {
        showLoading();
        api.get('weapp/get-construction-case-class-list', params).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({
                    list: res.data.data
                });
            }
        })
    },
    goCategoryPage: function(e) {
        const item = e.currentTarget.dataset.item;
        const params = JSON.stringify({
            class_id: item.id,
            merchant_id: item.merchant_id,
            store_id: item.store_id
        });
        wx.navigateTo({
            url: 'category?params=' + params
        });
    },
    onLoad: function(options) {
        // this.setData({
        //     'form.merchant_id': options.merchant_id,
        //     'form.store_id': options.store_id
        // });
        this.getList({
            merchant_id: options.merchantId,
            store_id: options.storeId
        })
    },

})