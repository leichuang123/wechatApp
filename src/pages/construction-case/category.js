import api from '../../utils/api.js';
import { showLoading } from '../../utils/util.js';
Page({
    data: {
        list: []

    },
    getList: function(params) {
        showLoading();
        api.get('weapp/get-construction-case-list', params).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({
                    list: res.data.data
                });
            }
        })
    },
    onLoad: function(options) {
        console.log(options)
        this.getList(JSON.parse(options.params));
    },
    onShow: function() {

    },
    onShareAppMessage: function() {

    }
})