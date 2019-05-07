import api from '../../utils/api';
import { confirmMsg, showLoading } from '../../utils/util';
Page({
    data: {
        rate: 5,
        distance: 0,
        total_oil: 0,
        avg_speed: 0,
        startTime: '',
        endTime: '',
        startaddress: '',
        endstartress: '',
        travel_id: '',
        start: '',
        end: ''
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
            sessionKey: sessionKey
        };
        api.get('weapp-obd-user-car/single-travel', param).then(res => {
            self.setData({
                rate: res.data.total.star,
                distance: res.data.total.distance,
                total_oil: res.data.total.total_oil,
                avg_speed: res.data.total.avg_speed
            });
            wx.hideLoading();
        });
    },
    //历史轨迹
    history() {
        wx.navigateTo({
            url:
                '/pages/schedule-list/history?travel_id=' +
                this.data.travel_id +
                '&start=' +
                this.data.start +
                '&end=' +
                this.data.end
        });
    },
    onLoad: function(options) {
        this.setData({
            startTime: options.short_stime,
            endTime: options.short_etime,
            startaddress: options.startaddress,
            endstartress: options.endstartress,
            travel_id: options.travel_id,
            start: options.start,
            end: options.end
        });
        const sessionKey = wx.getStorageSync('sessionKey');
        const obd_device_id = wx.getStorageSync('obd_device_id')[0];
        this.getonce(options.start, options.end, options.travel_id, obd_device_id, sessionKey);
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {}
});
