import api from '../../utils/api';
import { toastMsg, showLoading } from '../../utils/util';
Page({
    data: {
        categories: [],
        car: {},
    },
    /**
     * 获取车型版本
     */
    getCategories: function (displacementId) {
        showLoading();
        api.get('weapp/getcarcategory', { year_id: displacementId }, false).then((res) => {
            wx.hideLoading();
            this.setData({ categories: res.errcode === 0 ? res.data : [] });
        });
    },
    /**
     * 添加车辆
     */
    addCar: function (e) {
        const item = e.currentTarget.dataset.item;
        const car = wx.getStorageSync('car');
        if (car.action == 'add') {
            const carData = {
                car_number: car.car_number,
                car_brand: car.brand_id,
                car_category: item.id,
                engine_power: car.displacement_id,
                produce_year: car.year_id,
                car_serie: car.serie_id,
            };
            showLoading('提交请求中');
            api.post('weapp/addcar', carData).then((res) => {
                wx.hideLoading();
                const msg = res.errcode === 0 ? '添加成功' : res.errmsg;
                const msgType = res.errcode === 0 ? 'success' : 'error';
                toastMsg(msg, msgType, 1000, () => {
                    wx.navigateBack({ delta: 5 });
                });
                let userData = wx.getStorageSync('userData');
                userData.car.push[car.car_number];
                wx.setStorageSync('userData', userData);
                wx.removeStorageSync('car');
            });
        } else {
            const updateCarData = {
                car_id: car.car_id,
                car_number: car.car_number,
                action: 'edit',
                car_brand_logo: car.logo,
                car_brand: car.brand_id,
                car_brand_name: car.car_brand_name,
                car_serie: car.serie_id,
                car_serie_name: car.car_department,
                engine_power: car.displacement_id,
                engine_power_name: car.displacement,
                produce_year: car.year_id,
                produce_year_name: car.year,
                car_category: item.id,
                car_category_name: item.car_category,
            };
            wx.setStorageSync('updateCarData', updateCarData);
            if (car.action == 'list') {
                wx.navigateTo({ url: '/pages/my-car/detail?action=list' });
            } else {
                wx.navigateBack({ delta: 4 });
            }
        }
    },
    initData: function (params) {
        let car = wx.getStorageSync('car');
        let carYearData = JSON.parse(params);
        car.year_id = carYearData.id;
        car.year = carYearData.productive_year;
        wx.setStorageSync('car', car);
        this.setData({
            car: car,
        });
        this.getCategories(carYearData.id);
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.initData(options.params);
    },
});
