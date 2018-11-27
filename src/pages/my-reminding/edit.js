import api from '../../utils/api';
import { toastMsg, confirmMsg, showLoading, formatTime, goBack, showTopTips } from '../../utils/util';
Page({
    data: {
        showTopTips: false,
        errorMsg: '',
        form: {
            remind_id: 0,
            car_id: 0,
            name: '',
            expire_time: '',
            remind_type: 0,
            expire_time_type: 0,
            remind_day_before: '',
            remind_frequency: 1
        },
        expireTimeNameMap: ['到期时间', '年审到期时间', '保险到期时间', '保养到期时间'],
        frequencyOptions: ['仅一次', '6个月', '每年', '每2年', '每2年', '每10年', '不提醒'],
        frequencyIndex: 0,
        REMIND_TYPE_LICENSE: 1,
        REMIND_TYPE_CAR: 2
    },
    onExpireTimeChange: function(e) {
        const expireTIme = e.detail.value;
        this.setData({
            'form.expire_time': expireTIme,
            'form.remind_time': this.getRemindTime(expireTIme, this.data.form.remind_day_before)
        });
    },
    onFrequencyChange: function(e) {
        const index = e.detail.value;
        this.setData({ frequencyIndex: index, 'form.remind_frequency': Number(index) + 1 });
        console.log(this.data.form.remind_frequency);
    },
    onNameChange: function(e) {
        this.setData({
            'form.name': e.detail.value
        });
    },
    getRemindTime: function(expireTime, day) {
        let remindTime = '';
        if (expireTime !== '' && day > 0) {
            const dd = new Date(expireTime);
            remindTime = formatTime(new Date(dd.setDate(dd.getDate() - day)), false);
        }
        return remindTime;
    },
    onRemindDayChange(e) {
        const day = e.detail.value;
        if (day < 0) {
            return;
        }
        this.setData({
            'form.remind_day_before': day,
            'form.remind_time': this.getRemindTime(this.data.form.expire_time, day)
        });
    },
    validateForm: function() {
        if (this.data.form.remind_type == this.data.REMIND_TYPE_LICENSE && !this.data.form.name) {
            return '请填写姓名';
        }
        if (this.data.form.expire_time === '') {
            return '请填写' + this.data.expireTimeName;
        }
        if (!this.data.form.remind_day_before) {
            return '请填写提前几天提醒';
        }
        if (this.data.form.remind_frequency === null) {
            return '请填写提骑行周期';
        }
        return '';
    },
    onAddReminding: function() {
        const msg = this.validateForm();
        if (msg !== '') {
            showTopTips(this, msg);
        } else {
            this.addReminding();
        }
    },
    addReminding: function() {
        showLoading('请求中...');
        api.post('weapp/add-reminding', this.data.form)
            .then(res => {
                wx.hideLoading();
                if (res.errcode === 0) {
                    toastMsg('保存成功', 'success', 1000, () => {
                        this.goBack();
                    });
                } else {
                    confirmMsg('', res.errmsg, false);
                }
            })
            .catch(() => {
                wx.hideLoading();
            });
    },
    goBack: function() {
        wx.navigateBack({
            delta: 1
        });
    },
    initData: function(params) {
        console.log(params);
        this.setData({
            'form.expire_time_type': params.expire_time_type,
            'form.remind_type': params.remind_type,
            expireTimeName: this.data.expireTimeNameMap[params.expire_time_type]
        });
        if (params.action === 'edit') {
            this.setData({
                frequencyIndex: params.remind_frequency > 0 ? Number(params.remind_frequency) - 1 : 0,
                'form.name': params.name,
                'form.remind_id': params.remind_id,
                'form.remind_time': params.remind_time,
                'form.expire_time': params.expire_time,
                'form.remind_day_before': params.remind_day_before,
                'form.remind_frequency': params.remind_frequency > 0 ? params.remind_frequency : 1,
                'form.car_id': params.remind_type == this.data.REMIND_TYPE_CAR ? params.car_id : '',
                'form.logo': params.remind_type == this.data.REMIND_TYPE_CAR ? params.logo : '',
                'form.brand_serie': params.remind_type == this.data.REMIND_TYPE_CAR ? params.brand_serie : '',
                'form.car_number': params.remind_type == this.data.REMIND_TYPE_CAR ? params.car_number : ''
            });
        }
        console.log(this.data.form);
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.initData(JSON.parse(options.params));
    }
});
