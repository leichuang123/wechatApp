import api from '../../../utils/api';
import { confirmMsg, toastMsg, showLoading } from '../../../utils/util';
Page({
    data: {
        hasdata: false,
        index: '',
        carList: [],
        type: ['进入报警', '离开报警', '进出报警'],
        touchStartPageX: 0,
        scrollLeft: 0
    },
    //新增围栏
    addobd: function() {
        showLoading('跳转中');
        wx.navigateTo({
            url: 'add-fence',
            success() {
                wx.hideLoading();
            }
        });
    },
    //获取围栏信息列表
    getList: function() {
        showLoading();
        const param = {
            obd_device_id: wx.getStorageSync('obd_device_id')[0]
        };
        const self = this;
        api.get('weapp-obd-geofence/geofence-list', param).then(res => {
            if (res.errcode != 0) {
                self.setData({
                    hasdata: true
                });
                wx.hideLoading();
                return;
            }
            if (res.errcode == 100) {
                self.setData({
                    carList: []
                });
                return;
            }
            wx.hideLoading();
            self.setData({
                carList: res.data
            });
        });
    },
    //编辑围栏
    edit: function(e) {
        wx.navigateTo({
            url:
                'add-fence?fence_id=' +
                e.currentTarget.dataset.item.fence_id +
                '&where=' +
                e.currentTarget.dataset.item.address
        });
    },
    //确认是否删除
    sureDel: function(e) {
        const self = this;
        confirmMsg('', '是否删除该围栏', true, () => {
            const obd_device_id = e.currentTarget.dataset.item.obd_device_id;
            const fence_id = e.currentTarget.dataset.item.fence_id;
            for (let k in self.data.carList) {
                if (self.data.carList[k].fence_id == e.currentTarget.dataset.item.fence_id) {
                    self.setData({
                        index: k
                    });
                    break;
                }
            }
            this.delThis(obd_device_id, fence_id);
        });
    },
    //删除指定围栏
    delThis: function(obd_device_id, fence_id) {
        const param = {
            obd_device_id: obd_device_id,
            fence_id: fence_id
        };
        const slef = this;
        api.post('weapp-obd-geofence/delete-geofence', param).then(res => {
            if (res.errcode != 0) {
                confirmMsg('', res.errmsg, false);
                return;
            }
            toastMsg(res.errmsg, 'success', 1500, () => {
                if (slef.data.carList.length == 1) {
                    slef.setData({
                        carList: []
                    });
                }
                this.getList();
            });
        });
    },
    onLoad: function(options) {
        this.getList();
    },
    onShow: function() {}
});
