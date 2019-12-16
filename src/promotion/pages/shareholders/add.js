import { showTopTips, isMobile } from '../../../utils/util';
Page({
    /**
     * 页面的初始数据
     */
    data: {
        showTopTips: false,
        errorMsg: '',
        form: {
            contact: '',
            mobile: '',
            details: ''
        }
    },
    getInputValue: function(e) {
        const prop = 'form.' + e.currentTarget.dataset.name;
        this.setData({
            [prop]: e.detail.value
        });
    },
    onSubmit: function() {
        if (this.data.form.contact == '') {
            showTopTips(this, '请填写姓名');
            return;
        }
        if (!isMobile(this.data.form.mobile)) {
            showTopTips(this, '手机号格式不正确');
            return;
        }
        if (this.data.form.details == '') {
            showTopTips(this, '请填写申请描述');
            return;
        }
        wx.navigateTo({
            url: './addSuccess'
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {}
});
