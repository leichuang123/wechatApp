import api from '../../utils/api';
import { toastMsg, confirmMsg, showLoading } from '../../utils/util';
Page({
    data: {
        detail:null,
        form: {
            id: 0,
            name: '',
            expire_time: '',
            remind_type: 0,
            expire_time_type: 0,
            remind_day_before: 0,
            remind_frequency: 0
        },
        expireTimeNameMap: ['到期时间', '年审到期时间', '保险到期时间', '保养到期时间']
    },
    onExpireTimeChange: function(e) {
        this.setData({
            'form.expire_time': e.detail.value
        });
    },
    updateReminding: function() {
        showLoading();
        api.post('weapp/update-reminding', this.data.form)
            .then(res => {
                if (res.errcode === 0) {
                    toastMsg('保存成功', 'success');
                } else {
                    confirmMsg('', res.errmsg, false);
                }
            })
            .finally(() => {
                wx.hideLoading();
            });
    },
    getDetail:function() {
        showLoading();
        api.get('weappget-reminding-detail', { car_number: this.data.form.car_number })
            .then(res => {
                if (res.errcode === 0) {
                    this.detail = res.data;
                    return;
                }
                this.detail = null;
                confirmMsg('', res.errmsg, false);
            })
            .finally(() => {
                wx.hideLoading();
            });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // const params = JSON.parse(options.params);
        // this.setData({
        //     expireTimeName: this.data.expireTimeNameMap[params.expire_time_type],
        //     'form.remind_type': params.remind_type,
        //     'form.expire_time_type': params.expire_time_type
        // });
        // this.getDetail();
    }
});
