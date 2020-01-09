import { showTopTips, isMobile, showLoading, toastMsg } from '../../../utils/util';
import api from '../../../utils/api';
Page({
    /**
     * 页面的初始数据
     */
    data: {
        showTopTips: false,
        errorMsg: '',
        form: {
            name: '',
            phone: '',
            desc: ''
        },
        hasJoin: false
    },
    getInputValue: function(e) {
        const prop = 'form.' + e.currentTarget.dataset.name;
        this.setData({
            [prop]: e.detail.value
        });
    },
    onSubmit: function() {
        if (this.data.form.name == '') {
            showTopTips(this, '请填写姓名');
            return;
        }
        if (!isMobile(this.data.form.phone)) {
            showTopTips(this, '手机号格式不正确');
            return;
        }
        if (this.data.form.desc == '') {
            showTopTips(this, '请填写申请描述');
            return;
        }
        showLoading();
        api.post('/weapp/holder-application', this.data.form)
            .then(res => {
                wx.hideLoading();
                if (res.errcode == 0) {
                    toastMsg('提交成功', 'success', 1000, () => {
                        wx.navigateTo({
                            url: './addSuccess'
                        });
                    });
                    return;
                }
                toastMsg(res.errmsg, 'error');
            })
            .catch(() => {
                wx.hideLoading();
            });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {}
});
