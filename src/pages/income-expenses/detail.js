import { get } from '../../utils/api';
Page({
    data: {
        loanding: true,
        detail: {}
    },
    /**
     * 获取收支详情
     */
    getDetail: function(id) {
        get('weapp/flow-record-detail', { id: id }).then(res => {
            this.setData({ loanding: false });
            if (res.errcode === 0) {
                this.setData({ detail: res.data });
            }
        });
    },
    /**
     * 返回到上一页
     */
    goBack: function() {
        wx.navigateBack({
            delta: 1
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getDetail(options.id);
    }
})