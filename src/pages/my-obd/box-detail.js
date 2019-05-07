import api from '../../utils/api';
import { confirmMsg, toastMsg } from '../../utils/util';
Page({
    data: {
        simNum: '',
        cardNum: '',
        obd_device_id: ''
    },
    xiugai: function() {
        wx.navigateTo({
            url: '/pages/medical/medical?type=' + 3
        });
    },
    //获取智能盒详情
    getObd: function() {
        const param = {
            obd_device_id: wx.getStorageSync('obd_device_id')[0]
        };
        const self = this;
        api.get('weapp-obd-user/get-device', param).then(res => {
            if (res.errcode != 0) {
                confirmMsg('', res.errmsg, false);
                return;
            }
            self.setData({
                cardNum: res.data.car_number,
                simNum: res.data.imei,
                obd_device_id: res.data.obd_device_id
            });
        });
    },
    //立即订场
    sureUntie() {
        confirmMsg('', '确认要解绑智能盒与对应车辆吗？', true, () => {
            this.untie();
        });
    },
    //解绑设备
    untie: function() {
        const self = this;
        const param = {
            obd_device_id: self.data.obd_device_id
        };
        api.post('weapp-obd-user/untie-device', param).then(res => {
            if (res.errcode != 0) {
                confirmMsg('', res.errmsg, false);
                return;
            }
            toastMsg(res.errmsg, 'success', 1000, () => {});
            wx.navigateTo({
                url: '/pages/index/index'
            });
        });
    },
    onLoad: function(options) {
        this.getObd();
    },
    onShow: function() {}
});
