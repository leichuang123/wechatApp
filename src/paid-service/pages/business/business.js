import { getRequest } from '../../../utils/api';
const app = getApp();
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        businessList: [],
        form: {
            class_id: 0,
            longitude: '',
            latitude: ''
        }
    },
    /**
     * 获取业务分类列表
     */
    getBusinessList: function() {
        getRequest('weapp/business-list', this.data.form, false).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    loadingVisible: false,
                    hasData: res.data.data.length > 0 ? true : false,
                    businessList: res.data.data
                });
                return;
            }
            this.setData({
                loadingVisible: false,
                hasData: false,
                businessList: []
            });
        });
    },
    /**
     * 跳转到业务详情页面
     */
    gotoDetail: function(e) {
        wx.navigateTo({
            url: 'detail?id=' + e.currentTarget.dataset.id
        });
    },
    /**
     * 获取位置信息
     */
    getLocation: function() {
        app.getLocation(res => {
            this.setData({
                'form.latitude': res.latitude,
                'form.longitude': res.longitude
            });
            this.getBusinessList();
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({ 'form.class_id': options.id });
        this.getLocation();
    }
});
