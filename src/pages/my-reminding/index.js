import api from '../../utils/api';
import { toastMsg, confirmMsg, showLoading } from '../../utils/util';
const app = getApp();
const sliderWidth = 144; // 需要设置slider的宽度，用于计算中间位置
Page({
    data: {
        sliderOffset: 0,
        sliderLeft: 0,
        sliderWidth: sliderWidth,
        tabs: [{ name: '我的驾驶证', value: 0 }, { name: '我的车辆', value: 1 }],
        form: {
            type: 0
        },
        licenses: [],
        cars: [],
        REMIND_TYPE_LICENSE: 1,
        REMIND_TYPE_CAR: 2
    },
    getList: function() {
        showLoading();
        api.get('weapp/get-reminding-list').then(res => {
            wx.hideLoading();
            if (res.errcode == 0) {
                this.setData({ licenses: res.data.license, cars: res.data.car });
            }
        });
    },
    switchTab: function(e) {
        const index = e.currentTarget.id;
        if (index == this.data.form.type) {
            return;
        }
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            'form.type': index
        });
    },
    onDelete: function(e) {
        const item = e.currentTarget.dataset.item;
        const remindType = e.currentTarget.dataset.type;
        console.log(item);
        const params = {
            remind_id: remindType == this.data.REMIND_TYPE_LIENSE ? item.remind_id : 0,
            remind_type: remindType,
            car_id: remindType == this.data.REMIND_TYPE_CAR ? item.car_id : 0
        };
        confirmMsg('', '确定要删除吗', true, () => {
            this.deleteRemiding(params);
        });
    },
    deleteRemiding: function(params) {
        showLoading();
        api.post('weapp/delete-reminding', params)
            .then(res => {
                wx.hideLoading();
                if (res.errcode === 0) {
                    toastMsg('删除成功', 'success', 1000, () => {
                        this.getList();
                    });
                } else {
                    confirmMsg('', res.errmsg, false);
                }
            })
            .catch(() => {
                wx.hideLoading();
            });
    },
    gotoAddCarPage: function() {
        wx.navigateTo({ url: '/pages/my-car/add-car' });
    },
    gotoEditPage: function(params) {
        wx.navigateTo({ url: 'edit?params=' + JSON.stringify(params) });
    },
    onAdd: function(e) {
        const remindType = e.currentTarget.dataset.type;
        if (remindType == 1) {
            this.gotoEditPage({ action: 'add', remind_type: 1, expire_time_type: 0 });
        } else {
            this.gotoAddCarPage();
        }
    },
    onEdit: function(e) {
        const timeType = e.currentTarget.dataset.type;
        const item = e.currentTarget.dataset.item;
        let params = {};
        console.log(item.remind_type);
        if (item.remind_type == this.data.REMIND_TYPE_LICENSE) {
            params = item;
        } else {
            params = item.time[timeType];
            params.car_number = item.car_number;
            params.brand_serie = item.brand_serie;
            params.log = item.log;
        }
        params.action = 'edit';
        this.gotoEditPage(params);
    },

    onLoad: function(options) {
        this.setData({
            sliderLeft: (app.globalData.windowWidth / this.data.tabs.length - sliderWidth) / 2,
            sliderOffset: (app.globalData.windowWidth / this.data.tabs.length) * options.type
        });
    },
    onShow: function() {
        this.getList();
    }
});
