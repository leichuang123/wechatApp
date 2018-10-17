import api from '../../utils/api';
import { getDate, toastMsg, confirmMsg, isCarNumber } from '../../utils/util';
Page({
    data: {
        loading: false,
        keyboardVisible: false,
        carInfo: {},
        today: '',
        carNumber: '',
    },
    /**
     * 显示键盘
     */
    showKeyboard: function() {
        this.setData({
            keyboardVisible: true
        });
    },
    /**
     * 隐藏键盘
     */
    hideKeyboard: function(e) {
        this.setData({
            keyboardVisible: e.detail.keyboardVisible
        })
    },
    /**
     * 获取车牌号
     */
    getCarNumber: function(e) {
        this.setData({
            carNumber: e.detail.carNumber
        });
    },
    /**
     * 获取车详情
     */
    getCarInfo: function(id) {
        this.setData({ loading: true });
        api.getRequest('weapp/findcar', { car_id: id }).then(res => {
            this.setData({ loading: false });
            if (res.errcode === 0) {
                this.setData({
                    carInfo: res.data,
                    carNumber: res.data.car_number
                });
            }
        });
    },
    /**
     * 监听表单值的改变
     */
    changeItem: function(e) {
        let id = e.target.id;
        switch (id) {
            case 'buyTime':
                this.setData({
                    'carInfo.buy_time': e.detail.value
                })
                break;
            case 'traveled':
                this.setData({
                    'carInfo.traveled': e.detail.value
                })
                break;
            case 'insurance':
                this.setData({
                    'carInfo.last_insure': e.detail.value
                });
                break;
            case 'verify':
                this.setData({
                    'carInfo.car_verifi': e.detail.value
                });
                break;
        }
    },
    /**
     * 更新车辆信息
     */
    updateCar: function() {
        if (!isCarNumber(this.data.carNumber)) {
            confirmMsg('提示', '请填写有效的车牌号', false);
            return;
        }
        let carData = this.data.carInfo;
        let params = {
            car_id: carData.id,
            car_number: this.data.carNumber,
            traveled: carData.traveled,
            buy_time: carData.buy_time,
            last_insure: carData.last_insure,
            car_verifi: carData.car_verifi,
            car_brand: carData.car_brand,
            car_serie: carData.car_serie,
            engine_power: carData.engine_power,
            produce_year: carData.produce_year,
            car_category: carData.car_category
        }
        wx.showLoading({
            title: '提交请求中',
        });
        api.postRequest('weapp/updatecar', params).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                wx.removeStorageSync('updateCarData');
                toastMsg('更新成功', 'success',1000,()=>{
                    wx.navigateTo({
                        url: 'my-car',
                    });
                });
                return;
            }
            confirmMsg('',res.errmsg, false);
        });
    },
    /**
     * 跳转到车品牌页面
     */
    gotoCars: function() {
        wx.setStorageSync('car', { car_number: this.data.carNumber, action: 'edit', car_id: this.data.carId });
        wx.navigateTo({
            url: '/pages/cars/cars'
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            carId: options.id,
            today: getDate()
        });
        if (options.action === '') {
            this.getCarInfo(options.id);
        }
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        let updateCarData = wx.getStorageSync('updateCarData');
        if (updateCarData !== undefined && updateCarData.action == 'edit') {
            this.setData({
                carNumber: updateCarData.car_number,
                'carInfo.car_number': updateCarData.car_number,
                'carInfo.action': updateCarData.action,
                'carInfo.car_brand_logo': updateCarData.car_brand_logo,
                'carInfo.car_brand': updateCarData.car_brand,
                'carInfo.car_brand_name': updateCarData.car_brand_name,
                'carInfo.car_serie': updateCarData.car_serie,
                'carInfo.car_serie_name': updateCarData.car_serie_name,
                'carInfo.engine_power': updateCarData.engine_power,
                'carInfo.engine_power_name': updateCarData.engine_power_name,
                'carInfo.produce_year': updateCarData.produce_year,
                'carInfo.produce_year_name': updateCarData.produce_year_name,
                'carInfo.car_category': updateCarData.car_category,
                'carInfo.car_category_name': updateCarData.car_category_name,
                'carInfo.id': updateCarData.car_id,
            });
            wx.removeStorageSync('updateCarData');
        }
    }
})