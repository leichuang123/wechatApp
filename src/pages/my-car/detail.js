import api from '../../utils/api';
import { getDate, toastMsg, confirmMsg, isCarNumber, showLoading } from '../../utils/util';
Page({
    data: {
        keyboardVisible: false,
        carInfo: {},
        today: '',
        carNumber: ''
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
        });
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
        showLoading();
        api.get('weapp/findcar', { car_id: id }).then(res => {
            wx.hideLoading();
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
        const prop = 'carInfo.' + e.target.id;
        this.setData({
            [prop]: e.detail.value
        });
    },
    /**
     * 更新车辆信息
     */
    updateCar: function() {
        if (!isCarNumber(this.data.carNumber)) {
            confirmMsg('提示', '请填写有效的车牌号', false);
            return;
        }
        const params = {
            car_id: this.data.carInfo.id,
            car_number: this.data.carNumber,
            old_car_number: this.data.carInfo.car_number,
            traveled: this.data.carInfo.traveled,
            buy_time: this.data.carInfo.buy_time,
            last_insure: this.data.carInfo.last_insure,
            car_verifi: this.data.carInfo.car_verifi,
            car_brand: this.data.carInfo.car_brand,
            car_serie: this.data.carInfo.car_serie,
            engine_power: this.data.carInfo.engine_power,
            produce_year: this.data.carInfo.produce_year,
            car_category: this.data.carInfo.car_category
        };
        showLoading('提交请求中');
        api.post('weapp/updatecar', params).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                wx.removeStorageSync('updateCarData');
                toastMsg('更新成功', 'success', 1000, () => {
                    wx.navigateTo({
                        url: 'my-car'
                    });
                });
                return;
            }
            confirmMsg('', res.errmsg, false);
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
        if (!!updateCarData && updateCarData.action == 'edit') {
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
                'carInfo.id': updateCarData.car_id
            });
            wx.removeStorageSync('updateCarData');
        }
    }
});
