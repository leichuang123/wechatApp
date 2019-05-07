import api from '../../utils/api';
import { confirmMsg, showLoading } from '../../utils/util';
Page({
    data: {
        carList: []
    },
    //获取绑定的设备车辆
    getBind: function() {
        showLoading();
        const param = {
            sessionKey: wx.getStorageSync('sessionKey')
        };
        const self = this;
        api.get('weapp-obd-user-car/device-list', param).then(res => {
            if (res.errcode != 0) {
                confirmMsg('', res.errmsg, false);
                return;
            }
            self.setData({
                carList: res.data.items
            });
            wx.hideLoading();
        });
    },
    see: function(e) {
        //切换设备选中即置顶
        const storage = wx.getStorageSync('obd_device_id');
        storage.unshift(e.currentTarget.dataset.item.obd_device_id);
        wx.setStorageSync('obd_device_id', storage);
        wx.navigateTo({
            url: '/pages/medical/medical-map'
        });
    },
    //绑定智能盒子
    addobd: function() {
        wx.navigateTo({
            url: '/pages/medical/medical?type=1'
        });
    },
    onLoad: function(options) {
        this.getBind();
    },
    onShow: function() {}
});
