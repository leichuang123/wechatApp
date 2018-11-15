import { get } from '../../utils/api';
import { showLoading } from '../../utils/util';
Page({
    data: {
        displacement: [],
        car: {}
    },
    /**
     * 获取车排量
     */
    getDisplacement: function(id) {
        showLoading();
        get('weapp/getcardisplacement', { serie_id: id }, false).then(res => {
            wx.hideLoading();
            this.setData({ displacement: res.errcode === 0 ? res.data : [] });
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({ car: wx.getStorageSync('car') });
        this.getDisplacement(options.id);
    }
});
