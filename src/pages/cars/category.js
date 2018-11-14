import api from '../../utils/api';
import { toastMsg } from '../../utils/util';
Page({
    data: {
        loading: true,
        categories: [],
        car: {},
        cateForm: {
            displacement_id: ''
        },
        addForm: {
            car_number: '',
            car_brand: '',
            car_category: '',
            engine_power: '',
            produce_year: '',
            car_serie: ''
        }
    },
    /**
     * 获取车型版本
     */
    getCategories: function() {
        api.get('weapp/getcarcategory', this.data.cateForm, false).then(res => {
            this.setData({ loading: false });
            if (res.errcode === 0) {
                this.setData({
                    categories: res.data
                });
                return;
            }
            this.setData({
                categories: []
            });
        });
    },
    /**
     * 添加车辆
     */
    addCar: function(e) {
        let item = e.currentTarget.dataset.item,
            car = wx.getStorageSync('car');
        if (car.action == 'add') {
            this.setData({
                addForm: {
                    car_number: car.car_number,
                    car_brand: car.brand_id,
                    car_category: item.id,
                    engine_power: car.displacement_id,
                    produce_year: car.year_id,
                    car_serie: car.serie_id
                }
            });
            wx.showLoading({
                title: '提交请求中',
                mask: true
            });
            api.post('weapp/addcar', this.data.addForm).then(res => {
                wx.hideLoading();
                let msg = res.errcode === 0 ? '添加成功' : res.errmsg,
                    msgType = res.errcode === 0 ? 'success' : 'error';
                toastMsg(msg, msgType, 1000, () => {
                    wx.navigateBack({
                        delta: 5
                    });
                });
                let userData = wx.getStorageSync('userData');
                userData.car.push[car.car_number];
                wx.setStorageSync('userData', userData);
                wx.removeStorageSync('car');
            });
        } else {
            let action = car.action;
            let updateCarData = {
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
                car_category_name: item.car_category
            };
            wx.setStorageSync('updateCarData', updateCarData);
            if (action == 'list') {
                wx.navigateTo({
                    url: '/pages/my-car/detail?action=list'
                });
            } else {
                wx.navigateBack({
                    delta: 4
                });
            }
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let car = wx.getStorageSync('car'),
            carYearData = JSON.parse(options.params);
        car.year_id = carYearData.id;
        car.year = carYearData.productive_year;
        wx.setStorageSync('car', car);
        this.setData({
            'cateForm.displacement_id': carYearData.displacement_id,
            car: car
        });
        this.getCategories();
    }
});
