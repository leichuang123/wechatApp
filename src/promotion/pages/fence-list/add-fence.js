import api from '../../../utils/api';
import { confirmMsg, toastMsg, showLoading } from '../../../utils/util';
Page({
    data: {
        model: false,
        items: [
            { name: '进入报警', value: 1, checked: 'true' },
            { name: '离开报警', value: 2, checked: 'false' },
            { name: '进出报警', value: 3, checked: 'false' }
        ],
        fence_id: '',
        http: 'weapp-obd-geofence/create-geofence',
        fence_name: '',
        alarm_type: 1,
        height: '',
        latitude: null,
        longitude: null,
        markers: [
            {
                id: 0,
                latitude: null,
                longitude: null
            }
        ],
        adress: '',
        scale: 18, //12-18
        sliderScale: 12,
        step: 100 //辅助计算
    },
    //编辑初始化
    init: function(id) {
        showLoading();
        const self = this;
        const param = {
            obd_device_id: wx.getStorageSync('obd_device_id')[0],
            fence_id: id
        };
        api.get('weapp-obd-geofence/geofence-detail', param).then(res => {
            if (res.errcode != 0) {
                confirmMsg('', res.errmsg, false);
                return;
            }
            wx.hideLoading();
            const phoneData = wx.getStorageSync('systemInfo');
            self.setData({
                height: phoneData.screenHeight - 152,
                latitude: res.data.lat,
                longitude: res.data.lng,
                step: res.data.radius,
                sliderScale: (parseInt(res.data.radius) - 100) / 100 + 12,
                scale: 30 - ((parseInt(res.data.radius) - 100) / 100 + 12),
                fence_name: res.data.fence_name,
                'markers[0].latitude': res.data.lat,
                'markers[0].longitude': res.data.lng,
                alarm_type: res.data.alarm_type
            });
        });
    },
    //监听地图中心点改变
    bindregionchange: function() {
        this.getCenterLocation();
    },
    //获取中心点的位置
    getCenterLocation: function() {
        const that = this;
        that.mapCtx.getCenterLocation({
            success(res) {
                that.setData({
                    'markers[0].latitude': res.latitude,
                    'markers[0].longitude': res.longitude
                });
                api.get('/weapp-obd-geofence/get-address-detail', { lat: res.latitude, lng: res.longitude }).then(
                    res => {
                        if (res.errcode == 0) {
                            that.setData({
                                adress: res.data.address
                            });
                        }
                    }
                );
            }
        });
    },
    //slider取值同步圆半径和地图缩放
    sliderchange: function(e) {
        const arr = [100, 200, 700, 1500, 3000, 4000, 5000];
        const steps = 100 * (e.detail.value - 12) + 100;
        this.setData({
            sliderScale: e.detail.value, //滑块值
            scale: 30 - e.detail.value, //地图缩放
            'circles[0].radius': steps, //半径
            step: arr[e.detail.value - 12]
        });
    },
    //input
    inputChange(e) {
        this.setData({
            fence_name: e.detail.value
        });
    },
    //radio
    radioChange(e) {
        this.setData({
            alarm_type: parseInt(e.detail.value)
        });
    },
    //确认然后编辑信息
    submit: function() {
        this.setData({
            model: true
        });
    },
    //确认提交请求
    isOk: function() {
        showLoading();
        const self = this;
        if (self.data.fence_name == '') {
            confirmMsg('', '请填写完整信息', false);
            return;
        }
        const param = {
            obd_device_id: wx.getStorageSync('obd_device_id')[0],
            lat: self.data.latitude,
            lng: self.data.longitude,
            radius: self.data.step,
            fence_name: self.data.fence_name,
            alarm_type: self.data.alarm_type
        };
        api.post(self.data.http, param).then(res => {
            if (res.errcode != 0) {
                toastMsg(res.errmsg, 'error');
                return;
            }
            wx.hideLoading();
            this.setData({
                model: false
            });
            toastMsg(res.errmsg, 'success', 1500, () => {
                wx.redirectTo({
                    url: 'fence-list'
                });
            });
        });
    },
    //取消
    isCancle: function() {
        this.setData({
            model: false
        });
    },
    onLoad: function(options) {
        this.mapCtx = wx.createMapContext('myMap');
        const phoneData = wx.getStorageSync('systemInfo');
        const locationInfo = wx.getStorageSync('locationInfo');
        this.setData({
            latitude: locationInfo.latitude,
            longitude: locationInfo.longitude,
            height: phoneData.screenHeight - 152
        });
        if (options.fence_id) {
            this.setData({
                fence_id: options.fence_id,
                http: 'weapp-obd-geofence/edit-geofence'
            });
            this.init(options.fence_id);
            return;
        }
    },
    onShow: function() {}
});
