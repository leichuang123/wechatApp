import { get } from '../../utils/api';
Page({
    data: {
        loading: true,
        displacement: [],
        car: {},
        serieId: 0
    },
    /**
     * 获取车排量
     */
    getDisplacement: function() {
        get('weapp/getcardisplacement', { serie_id: this.data.serieId }, false).then(res => {
            this.setData({ loading: false });
            if (res.errcode === 0) {
                this.setData({
                    displacement: res.data
                });
                return;
            }
            this.setData({
                displacement: []
            });
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let car = wx.getStorageSync('car');
        this.setData({
            serieId: options.id,
            car: car
        });
        this.getDisplacement();
    }
});
