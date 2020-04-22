import api from '../../utils/api';
import { confirmMsg, showTopTips, isMobile, showLoading } from '../../utils/util';
Page({
    data: {
        dialogVisible: false,
        carIndex: 0,
        cateId: 0,
        tempCateId: 0,
        cateName: '',
        categories: [],
        carNumbers: [],
        form: {
            merchant_id: 0,
            store_id: 0,
            car_number: '',
            category: '',
            mobile: '',
            contact: '',
            traveled: '',
            reserve_time: ''
        },
        errorMsg: '',
        policy: {}
    },
    /**
     * 获取服务分类
     */
    getCategories: function() {
        showLoading();
        const params = { merchant_id: this.data.form.merchant_id, store_id: this.data.form.store_id };
        api.get('weapp/category', params, false).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                const cates = res.data.data;
                this.setData({
                    categories: cates,
                    cateId: res.data.default.id,
                    'form.category': res.data.default.id,
                    cateName: res.data.default.name
                });
            }
        });
    },
    /**
     * 获取预约政策
     */
    getPolicy: function() {
        const params = { merchant_id: this.data.form.merchant_id, store_id: this.data.form.store_id };
        api.get('weapp/reserverule', params, false).then(res => {
            if (res.errcode === 0) {
                this.setData({ policy: res.data });
            } else {
                this.setData({ policy: {} });
            }
        });
    },
    /**
     * 打开服务类型选择者对话框
     */
    onChooseCategory: function() {
        this.setData({
            dialogVisible: true
        });
    },
    /**
     * 监听选择器改变
     */
    changeCarNumber: function(e) {
        let index = e.detail.value;
        let carNumbers = this.data.carNumbers[index];
        this.setData({
            carIndex: index,
            'form.car_number': carNumbers
        });
    },
    /**
     * 监听服务类型选项改变
     */
    categoryChange: function(e) {
        this.setData({
            tempCateId: e.detail.value
        });
    },
    /**
     * 表单验证
     */
    validate: function() {
        let form = this.data.form;
        if (!form.category) {
            return '请选择服务类型';
        } else if (form.contact === '') {
            return '请填写联系人';
        } else if (!isMobile(form.mobile)) {
            return '请填写有效的手机号码';
        } else if (form.reserve_time === '') {
            return '请填写到店时间';
        } else {
            return '';
        }
    },
    /**
     * 预约
     */
    addReservation: function(e) {
        wx.setStorageSync('linkman', this.data.form.contact);
        const errMsg = this.validate();
        if (errMsg !== '') {
            showTopTips(this, errMsg);
        } else {
            showLoading('提交请求中');
            let form = {
                merchant_id: this.data.form.merchant_id,
                store_id: this.data.form.store_id,
                car_number: this.data.form.car_number,
                category: this.data.form.category,
                mobile: this.data.form.mobile,
                contact: this.data.form.contact,
                traveled: this.data.form.traveled,
                reserve_time:
                    this.data.form.reserve_time.split(' ')[0] +
                    ' ' +
                    this.data.form.reserve_time.split(' ')[1].split('-')[0]
            };
            api.post('weapp/addreserve', form).then(res => {
                wx.hideLoading();
                if (res.errcode === 0) {
                    wx.navigateTo({ url: 'detail?reservationData=' + JSON.stringify(res.data) });
                } else {
                    confirmMsg('提示', res.errmsg, false, () => {
                        wx.navigateBack({ delta: 2 });
                    });
                }
            });
        }
    },
    /**
     * 获取输入框的值
     */
    getInputValue: function(e) {
        const prop = 'form.' + e.currentTarget.dataset.name;
        this.setData({
            [prop]: e.detail.value
        });
    },
    /**
     * 关闭对话框
     */
    onDialogClose: function() {
        this.setData({
            dialogVisible: false,
            tempCateId: 0
        });
    },
    /**
     * 查找所选服务类型的名称
     */
    findCateIndex: function(id) {
        return this.data.categories.findIndex(item => id == item.id);
    },
    /**
     * 选择服务分类
     */
    chooseCategory: function() {
        const id = this.data.tempCateId == 0 ? this.data.cateId : this.data.tempCateId;
        const index = this.findCateIndex(id);
        this.setData({
            dialogVisible: false,
            cateId: id,
            'form.category': id,
            cateName: index > -1 ? this.data.categories[index].name : ''
        });
    },
    initData(options) {
        const userData = wx.getStorageSync('userData');
        const linkman = wx.getStorageSync('linkman');
        const params = JSON.parse(options.params);
        const carNumber = userData ? userData.default_car : '';
        this.setData({
            'form.store_id': params.store_id,
            'form.merchant_id': params.merchant_id,
            'form.car_number': userData.default_car ?  userData.default_car:'',
            'form.mobile': userData ? userData.mobile : '',
            'form.contact': !linkman ? '' : linkman,
            carNumbers: !!userData ? userData.car : []
        });
        if (this.data.carNumbers.length > 0) {
            const index = this.data.carNumbers.indexOf(carNumber);
            this.setData({ carIndex: index > -1 ? index : 0 });
        }
        this.getCategories();
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.initData(options);
    }
});
