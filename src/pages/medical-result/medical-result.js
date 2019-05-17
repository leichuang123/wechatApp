import api from '../../utils/api';
import { toastMsg } from '../../utils/util';
Page({
    data: {
        result: {},
        excel: false,
        opts1: {
            lazyLoad: true // 延迟加载组件
        }
    },
    //获取实时车况
    getResult() {
        const param = {
            obd_device_id: wx.getStorageSync('obd_device_id')[0]
        };
        api.get('weapp-obd-user-car/car-info', param).then(res => {
            if (res.errcode == 0) {
                this.setData({
                    result: res.data
                });
                return;
            }
            toastMsg(res.errmsg, 'error', 2000);
        });
    },
    showexcel: function() {
        this.setData({
            excel: true
        });
    },
    hidexcel: function() {
        this.setData({
            excel: false
        });
    },
    onLoad: function(options) {
        const self = this;
        self.getResult();
    }
});
