import api from '../../utils/api';
import { toastMsg, confirmMsg } from '../../utils/util';
Page({
    data: {
        carVisible: false,
        isRegistered: false,
        loadingVisible: true,
        hasData: true,
        carNumber: '',
        carId: '',
        cars: []
    },
    /**
     * 获取用户名下所有的车
     */
    getCars: function() {
        api.getRequest('weapp/car').then(res => {
            if (res.errcode === 0) {
                this.setData({
                    cars: res.data,
                    hasData: true,
                    loadingVisible: false
                });
                if (this.data.cars.length == 1 && !this.data.cars[0].car_brand) {
                    this.setData({
                        carVisible: true,
                        carId: this.data.cars[0].id
                    });
                } else {
                    this.setData({
                        carVisible: false
                    });
                }
            } else {
                this.setData({
                    cars: [],
                    carVisible: false,
                    hasData: false,
                    loadingVisible: false
                });
            }
        });
    },
    /**
     * 跳转到添加车牌号页面
     */
    gotoAddCar: function() {
        if (this.data.isRegistered) {
            wx.navigateTo({
                url: 'add-car'
            });
        } else {
            wx.navigateTo({
                url: '/pages/register/register'
            });
        }
    },
    /**
     * 跳转到车型选择页面
     */
    gotoCars: function() {
        wx.setStorageSync('car', {
            car_number: this.data.carNumber,
            action: 'list',
            car_id: this.data.carId
        });
        wx.navigateTo({
            url: '/pages/cars/cars'
        });
    },
    /**
     * 删除车辆信息
     */
    deleteCar: function(e) {
        const item = e.currentTarget.dataset.item;
        const userData = wx.getStorageSync('userData');
        const params = {
            car_id: item.id,
            car_number: item.car_number,
            user_id: !!userData ? userData.user_data.id : null
        };
        confirmMsg('提示', '确定要删除该车辆吗', true, () => {
            api.postRequest('weapp/delcar', params).then(res => {
                if (res.errcode === 0) {
                    toastMsg('删除成功', 'success', 1000, () => {
                        this.getCars();
                        if (item.is_default == 1) {
                            const index = userData.user_data.car.indexOf(item.car_number);
                            if (index > -1) {
                                userData.user_data.car.splice(index, 1);
                                wx.setStorageSync('userData', userData);
                            }
                        }
                    });
                } else {
                    toastMsg(res.errmsg, 'error');
                }
            });
        });
    },
    /**
     * 设置默认车辆
     */
    setDefault: function(e) {
        let item = e.currentTarget.dataset.item;
        api.postRequest('weapp/defaultcar', {
            car_id: item.id
        }).then(res => {
            if (res.errcode === 0) {
                let userData = wx.getStorageSync('userData');
                userData.user_data.default_car = item.car_number;
                wx.setStorageSync('userData', userData);
                this.getCars();
            } else {
                toastMsg(res.errmsg, 'error');
            }
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let userData = wx.getStorageSync('userData'),
            defaultCar = !!userData ? userData.user_data.default_car : '';
        this.setData({
            carNumber: defaultCar,
            isRegistered: !!userData ? userData.isRegist : false
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.getCars();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.setData({
            cars: [],
            hasMore: true
        });
        this.getCars();
    }
});
