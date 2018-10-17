import { getRequest } from '../../../utils/api';
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        tabIndex: 0,
        business: {},
        evaluations:[],
        tabList: ['业务描述', '办理流程', '办理条件', '所需资料', '客户评价']
    },
    /**
     * 切换选项卡
     */
    switchTab: function(e) {
        this.setData({
            tabIndex: e.currentTarget.dataset.index
        });
    },
    /**
     * 获取业务详情
     */
    getBusinessDetail: function(id) {
        getRequest('weapp/business-detail', { business_id: id }, false).then(res => {
            if (res.errcode === 0) {
                for (let i = 0, len = res.data.process.length; i < len; i++) {
                    res.data.process[i].open = false;
                }
                this.setData({
                    loadingVisible: false,
                    hasData: true,
                    business: res.data,
                    evaluations: res.data.evaluate.data
                });
                return;
            }
            this.setData({
                loadingVisible: false,
                hasData: false,
            });
        });
    },
    /**
     * 跳转到业务办理页面
     */
    gotoBusinessHandle: function() {
        let userData = wx.getStorageSync('userData');
        if (!!userData && userData.isRegist) {
            wx.navigateTo({
                url: 'handle?id=' + this.data.business.id,
            });
            return;
        }
        wx.navigateTo({
            url: '../../../pages/register/register',
        });
    },
    /**
     * 展开与收起办理流程项
     */
    togglePanel: function(e) {
        let index = e.currentTarget.dataset.index,
            items = this.data.business.process;
        items[index].open = !items[index].open;
        this.setData({
            'business.process': items
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getBusinessDetail(options.id);
    }
})