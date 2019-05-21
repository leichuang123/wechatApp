import api from '../../utils/api';
import { showLoading, confirmMsg } from '../../utils/util';
Page({
    data: {
        select: false,
        //selectarr: ['快', '中', '慢'],
        type: 1200,
        playing: true,
        height: '',
        latitude: '',
        longitude: '',
        markers: [
            {
                //iconPath: '../../assets/images/icons/gos.png',
                id: 0,
                latitude: '',
                longitude: ''
            },
            {
                // iconPath: '../../assets/images/icons/end.png',
                id: 1,
                latitude: '',
                longitude: ''
            }
        ],
        polyline: [
            {
                points: [],
                color: '#ff9800',
                width: 5,
                arrowLine: true
            }
        ]
    },
    //获取单个行程信息
    getonce(start, end, travel_id, obd_device_id, sessionKey) {
        showLoading();
        const self = this;
        const param = {
            start: start,
            end: end,
            travel_id: travel_id,
            obd_device_id: obd_device_id,
            sessionKey: sessionKey,
            require: 'travel_track'
        };
        api.get('weapp-obd-user-car/single-travel', param).then(res => {
            self.setData({
                latitude: res.data.total.start_address.OLat,
                longitude: res.data.total.start_address.OLng,
                'markers[0].latitude': res.data.total.start_address.OLat,
                'markers[0].longitude': res.data.total.start_address.OLng,
                'markers[1].latitude': res.data.total.end_address.OLat,
                'markers[1].longitude': res.data.total.end_address.OLng,
                'polyline[0].points': res.data.travel_track
            });
            wx.hideLoading();
        });
    },
    // //监听地图中心点改变
    // bindregionchange: function() {
    //     this.getCenterLocation();
    // },
    // //获取中心点的位置
    // getCenterLocation: function() {
    //     const that = this;
    //     that.mapCtx.getCenterLocation({
    //         success(res) {
    //             that.setData({
    //                 latitude: res.latitude,
    //                 longitude: res.longitude
    //             });
    //         }
    //     });
    // },
    onReady(e) {
        this.mapCtx = wx.createMapContext('myMap');
    },
    onLoad: function(options) {
        const phoneData = wx.getStorageSync('systemInfo');
        this.setData({
            height: phoneData.screenHeight
        });
        const sessionKey = wx.getStorageSync('sessionKey');
        const obd_device_id = wx.getStorageSync('obd_device_id')[0];
        this.getonce(options.start, options.end, options.travel_id, obd_device_id, sessionKey);
    },
    //打开速度选着框
    // speed: function() {
    //     this.setData({
    //         select: true
    //     });
    // },
    //切换速度
    // check: function(e) {
    //     const index = e.currentTarget.id;
    //     this.setData({
    //         type: index,
    //         select: false
    //     });
    // },
    //播放
    play: function() {
        this.setData({
            playing: false
        });
        wx.setNavigationBarTitle({
            title: '正在播放...'
        });
        var loop = null;
        var sindex = 1;
        var loopdata = this.data.polyline[0].points;
        const self = this;
        loop = setInterval(function() {
            self.setData({
                latitude: loopdata[sindex].latitude,
                longitude: loopdata[sindex].longitude
            });
            self.mapCtx.translateMarker({
                markerId: 0,
                autoRotate: false,
                duration: self.data.type, //速度
                //终点
                destination: loopdata[sindex],
                animationEnd: function() {
                    sindex += 1;
                    if (sindex == loopdata.length) {
                        confirmMsg('', '播放结束', false);
                        //播放结束重新绘制地图及信息
                        self.setData({
                            latitude: self.data.markers[0].latitude,
                            longitude: self.data.markers[0].longitude,
                            markers: [
                                {
                                    id: 0,
                                    latitude: self.data.markers[0].latitude,
                                    longitude: self.data.markers[0].longitude
                                },
                                {
                                    id: 1,
                                    latitude: self.data.markers[1].latitude,
                                    longitude: self.data.markers[1].longitude
                                }
                            ],
                            playing: true
                        });
                        wx.setNavigationBarTitle({
                            title: '历史回放'
                        });
                        clearInterval(loop);
                        return;
                    }
                }
            });
        }, self.data.type);
    }
});
