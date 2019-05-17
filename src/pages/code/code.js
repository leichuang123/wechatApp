import api from '../../utils/api';
import { toastMsg, showLoading } from '../../utils/util';
Page({
    data: {
        showcode: false,
        list: []
    },
    /**
     * 一键查询
     */
    search: function() {
        showLoading();
        const param = {
            obd_device_id: wx.getStorageSync('obd_device_id')[0]
        };
        const self = this;
        api.get('weapp-obd-exception/get-dtc-code', param).then(res => {
            if (res.errcode != 0) {
                toastMsg(res.errmsg, 'error');
                return;
            }
            wx.hideLoading();
            self.setData({
                list: res.data,
                showcode: true
            });
        });
    },
    /**
     * 清空发动机故障列表
     */

    clear: function() {
        showLoading();
        const param = {
            obd_device_id: wx.getStorageSync('obd_device_id')[0]
        };
        const self = this;
        api.post('weapp-obd-exception/delete-dtc-code', param).then(res => {
            if (res.errcode != 0) {
                toastMsg(res.errmsg, 'error');
                return;
            }
            wx.hideLoading();
            self.setData({
                list: [],
                showcode: false
            });
        });
    },
    onLoad: function(options) {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {}
});
