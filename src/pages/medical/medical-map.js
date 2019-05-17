import api from '../../utils/api';
import { toastMsg, showLoading } from '../../utils/util';
Page({
    data: {
        scale: 14,
        look: false,
        height: '',
        latitude: null,
        longitude: null,
        ca: '',
        Distance: '',
        FuelLv: '',
        markers: [
            {
                id: 1,
                latitude: null,
                longitude: null,
                iconPath: '../../assets/images/icons/personnone.png',
                width: 22,
                height: 22,
                callout: {
                    bgColor: '#ffffff',
                    color: '#101010',
                    padding: 10,
                    borderColor: 'gray',
                    borderRadius: 5,
                    fontSize: 14,
                    content: '',
                    display: 'ALWAYS'
                }
            }
        ]
    },
    //获取地图车辆信息
    getmap() {
        showLoading();
        const param = {
            obd_device_id: wx.getStorageSync('obd_device_id')[0]
        };
        api.get('weapp-obd-user-car/track-car', param).then(res => {
            if (res.errcode == 0) {
                this.setData({
                    ca: res.data.Item.DeviceName,
                    Distance: res.data.Distance,
                    FuelLv: res.data.FuelLv,
                    latitude: res.data.Item.Latitude,
                    longitude: res.data.Item.Longitude,
                    'markers[0]latitude': res.data.Item.Latitude,
                    'markers[0]longitude': res.data.Item.Longitude,
                    'markers[0]callout.content':
                        res.data.Item.DeviceName +
                        '\n' +
                        'Acc状态:' +
                        res.data.Item.Acc +
                        '\n' +
                        '状态:' +
                        res.data.Item.Acc +
                        '\n' +
                        '速度:' +
                        res.data.Item.Speed +
                        'km/h' +
                        '\n' +
                        '距离:' +
                        res.data.Distance +
                        'km/h' +
                        '\n' +
                        '定位时间:' +
                        res.data.Item.DeviceDate +
                        '\n' +
                        '更新时间:' +
                        res.data.Item.LastCommunication
                });
                wx.hideLoading();
                return;
            }
            this.setData({
                Distance: 0,
                FuelLv: 0
            });
            wx.hideLoading();
            toastMsg(res.errmsg, 'error', 2000);
        });
    },
    //实时车况
    realtime: function() {
        wx.navigateTo({
            url: '/pages/medical-result/medical-result'
        });
    },
    //车结果
    car: function() {
        wx.navigateTo({
            url: '/pages/medical-result/car-result'
        });
    },
    //车辆详情汇总
    details() {
        wx.navigateTo({
            url: '/pages/medical-result/details'
        });
    },
    //行程列表
    scheduce: function() {
        wx.navigateTo({
            url: '/pages/schedule-list/schedule-list'
        });
    },
    //故障代码
    code: function() {
        wx.navigateTo({
            url: '/pages/code/code'
        });
    },
    //设置
    setting: function() {
        wx.navigateTo({
            url: '/pages/obd-setting/obd-setting'
        });
    },
    //我的车库
    cars: function() {
        wx.navigateTo({
            url: '/pages/my-obd/my-obd'
        });
    },
    //警告信息
    police: function() {
        wx.navigateTo({
            url: '/pages/police/police'
        });
    },
    //开启卫星图
    includePoints: function() {
        if (this.data.look == false) {
            this.setData({
                look: true
            });
        } else {
            this.setData({
                look: false
            });
        }
    },
    //点击汽包查看智能详情
    bindcallouttap: function() {
        wx.navigateTo({
            url: '/pages/my-obd/box-detail'
        });
    },
    onReady(e) {
        this.getmap();
        // 使用 wx.createMapContext 获取 map 上下文
        this.mapCtx = wx.createMapContext('myMap');
    },
    onLoad: function(options) {
        const phoneData = wx.getStorageSync('systemInfo');
        this.setData({
            height: phoneData.screenHeight
        });
    },
    onShow: function() {}
});
