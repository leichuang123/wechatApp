import api from '../../../utils/api';
import { confirmMsg, getDate, showLoading } from '../../../utils/util';
Page({
    data: {
        value: '',
        date: '',
        lists: []
    },
    //获取行程列表
    scheduleList() {
        const param = {
            obd_device_id: wx.getStorageSync('obd_device_id')[0],
            date: this.data.date
        };
        const self = this;
        showLoading();
        api.get('weapp-obd-user-car/travel-list', param).then(res => {
            if (res.errcode != 0) {
                wx.hideLoading();
                confirmMsg('', res.errmsg, false);
                return;
            }
            if (res.data.length == 0) {
                wx.hideLoading();
                confirmMsg('', '暂无数据', false);
                return;
            }
            const data = res.data.items;
            self.setData({
                lists: data
            });
            wx.hideLoading();
        });
    },
    bindDateChange: function(e) {
        this.setData({
            date: e.detail.value
        });
        this.scheduleList();
    },
    //点击进入单个行程,通过data-item传递+url拼接传递参数
    detail: function(e) {
        wx.navigateTo({
            url:
                'schedule?travel_id=' +
                e.currentTarget.dataset.item.travel_id +
                '&start=' +
                e.currentTarget.dataset.item.startTime +
                '&end=' +
                e.currentTarget.dataset.item.endTime +
                '&short_stime=' +
                e.currentTarget.dataset.item.short_stime +
                '&short_etime=' +
                e.currentTarget.dataset.item.short_etime +
                '&startaddress=' +
                e.currentTarget.dataset.item.startAddress +
                '&endstartress=' +
                e.currentTarget.dataset.item.endAddress
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            date: getDate(0)
        });
        this.scheduleList();
    },
    onShow() {}
});
