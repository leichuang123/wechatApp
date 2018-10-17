import { getRequest } from '../../utils/api';
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        businessClassList: []
    },
    /**
     * 获取业务分类列表
     */
    getBusinessClassList: function() {
        getRequest('weapp/business-class-list', {}, false).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    businessClassList: res.data,
                    loadingVisible: false,
                    hasData: res.data.length > 0 ? true : false,
                });
                return;
            }
            this.setData({
                loadingVisible: false,
                hasData: fasle,
            });
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getBusinessClassList();
    }
})