import { post } from '../../utils/api';
import { toastMsg, confirmMsg, showTopTips, isMobile, isCarNumber, showLoading } from '../../utils/util';
Page({
    /**
     * 页面的初始数据
     */
    data: {
        keyboardVisible: false,
        showTopTips: false,
        errorMsg: '',
        feedbackTypeIndex: null,
        feedbackTypes: ['服务问题', '技术问题', '产品问题', '态度问题'],
        form: {
            merchant_id: 0,
            store_id: 0,
            feedback_type: 0,
            type: 1,
            car_number: '',
            contact: '',
            mobile: '',
            details: ''
        },
        radioItems: [{
                id: 1,
                name: '投诉',
                checked: true
            },
            {
                id: 2,
                name: '建议',
                checked: false
            }
        ]
    },
    /**
     * 显示键盘
     */
    showKeyboard: function() {
        this.setData({
            keyboardVisible: true
        });
    },
    /**
     * 隐藏键盘
     */
    hideKeyboard: function(e) {
        this.setData({
            keyboardVisible: e.detail.keyboardVisible
        });
    },
    /**
     * 获取车牌号
     */
    getCarNumber: function(e) {
        this.setData({
            'form.car_number': e.detail.carNumber
        });
    },
    onFeedbackTypeChange: function(e) {
        this.setData({
            feedbackTypeIndex: e.detail.value,
            'form.feedback_type': Number(e.detail.value) + 1
        });
    },
    getInputValue: function(e) {
        const prop = 'form.' + e.currentTarget.dataset.name;
        console.log(prop);
        this.setData({
            [prop]: e.detail.value
        });
    },
    radioChange: function(e) {
        const index = e.detail.value;
        const items = this.data.radioItems.map((n, i) => {
            return Object.assign({}, n, {
                checked: i == index
            });
        });
        this.setData({
            'form.type': items[index].id,
            radioItems: items
        });
    },
    /**
     * 表单验证
     */
    validate: function() {
        if (!this.data.form.feedback_type) {
            return '请选择反馈类型';
        }
        if (this.data.form.car_number && !isCarNumber(this.data.form.car_number)) {
            return '请填写有效的车牌号';
        }
        if (!isMobile(this.data.form.mobile)) {
            return '手机号格式不正确';
        }
        if (!this.data.form.details) {
            return '请填写问题详情';
        }
        return '';
    },
    onSubmit: function() {
        const errMsg = this.validate();
        if (errMsg !== '') {
            showTopTips(this, errMsg);
        } else {
            this.submit();
        }
    },
    submit: function() {
        showLoading();
        post('/weapp/add-complaint-advice', this.data.form).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                toastMsg(res.errmsg, 'success', 100, () => {
                    wx.navigateBack(1);
                });
            } else {
                confirmMsg('', res.errmsg, false, () => {
                    wx.navigateBack(1);
                });
            }
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            'form.merchant_id': options.merchantId,
            'form.store_id': options.storeId
        });
    }
});