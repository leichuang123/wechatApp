import { get } from '../../utils/api';
import { showLoading } from '../../utils/util';
Page({
    data: {
        years: [],
        car: {},
    },
    /**
     * 获取车生产年份
     */
    getYears: function (displacementId) {
        showLoading();
        get('weapp/getcarproductiveyear', { series_id: displacementId }, false).then((res) => {
            wx.hideLoading();
            this.setData({ years: res.errcode === 0 ? res.data : [] });
        });
    },
    gotoCategory: function (e) {
        wx.navigateTo({ url: 'category?params=' + JSON.stringify(e.currentTarget.dataset.item) });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let car = wx.getStorageSync('car');
        car.displacement_id = options.id;
        car.displacement = options.displacement;
        wx.setStorageSync('car', car);
        this.setData({
            car: car,
        });
        this.getYears(options.id);
    },
});
