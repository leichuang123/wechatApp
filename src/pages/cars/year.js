import { get } from '../../utils/api';
Page({
    data: {
        loading: true,
        years: [],
        car: {},
        displacementId: 0
    },
    /**
     * 获取车生产年份
     */
    getYears: function() {
        get('weapp/getcarproductiveyear', { displacement_id: this.data.displacementId }, false).then(res => {
            this.setData({ loading: false });
            if (res.errcode === 0) {
                this.setData({
                    years: res.data
                });
                return;
            }
            this.setData({
                years: []
            });
        });
    },
    gotoCategory: function(e) {
        let params = JSON.stringify(e.currentTarget.dataset.item);
        wx.navigateTo({
            url: 'category?params=' + params
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let car = wx.getStorageSync('car');
        car.displacement_id = options.id;
        car.displacement = options.displacement;
        wx.setStorageSync('car', car);
        this.setData({
            displacementId: options.id,
            car: car
        });
        this.getYears();
    }
});
