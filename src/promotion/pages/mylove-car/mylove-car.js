import api from '../../../utils/api';
Page({
    data: {
        carVisible: false,
        registered: false,
        loadingVisible: true,
        hasData: true,
        carNumber: '',
        carId: '',
        cars: [],
        type: '',
        simNum: '', //sim卡
        obdNum: '' //ime玛
    },
    /**
     * 获取用户名下所有的车
     */
    getCars: function() {
        api.get('weapp/car').then(res => {
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
    //点击选中改车
    select: function(e) {
        wx.redirectTo({
            url:
                '../medical/medical?carName=' +
                e.currentTarget.id +
                '&type=' +
                this.data.type +
                '&simNum=' +
                this.data.simNum +
                '&obdNum=' +
                this.data.obdNum
        });
    },
    //增加车辆
    addlove: function() {
        wx.navigateTo({
            url: '../../../pages/my-car/add-car'
        });
    },
    onLoad(options) {
        this.setData({
            type: options.type,
            simNum: options.simNum,
            obdNum: options.obdNum
        });
    },
    onShow() {
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
