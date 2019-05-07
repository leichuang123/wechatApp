import api from '../../utils/api';
import { confirmMsg, toastMsg, showLoading } from '../../utils/util';
Page({
    data: {
        callList: [],
        typeList: []
    },
    //获取报警列表
    getSetting: function() {
        const self = this;
        api.get('weapp-obd-exception/exception-list').then(res => {
            if (res.errcode != 0) {
                confirmMsg('', res.errmsg, false);
                return;
            }
            self.setData({
                callList: res.data.list,
                typeList: res.data.selected
            });
        });
    },
    checkboxChange: function(e) {
        this.setData({
            typeList: e.detail.value
        });
    },
    //取消返回
    cel: function() {
        wx.navigateBack({
            delta: 1
        });
    },
    //确定并提交报警信息设置
    sure: function() {
        showLoading();
        const self = this;
        const param = {
            type: self.data.typeList
        };
        api.post('weapp-obd-exception/select-exception', param).then(res => {
            if (res.errcode != 0) {
                confirmMsg('', res.errmsg, false);
                return;
            }
            wx.hideLoading();
            toastMsg(res.errmsg, 'success', 1200, () => {
                wx.navigateBack({
                    delta: 1
                });
            });
        });
    },
    onLoad: function(options) {
        this.getSetting();
    },
    onShow: function() {}
});
