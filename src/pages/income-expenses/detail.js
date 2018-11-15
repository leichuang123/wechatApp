import { get } from '../../utils/api';
import { showLoading } from '../../utils/util';
Page({
    data: {
        loanding: true,
        detail: {}
    },
    /**
     * 获取收支详情
     */
    getDetail: function(id) {
        showLoading();
        get('weapp/flow-record-detail', { id: id }).then(res => {
            wx.hideLoading();
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
});
