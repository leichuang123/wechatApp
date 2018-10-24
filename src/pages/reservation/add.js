import { getRequest, postRequest } from '../../utils/api';
import { confirmMsg, showTopTips, isMobile } from '../../utils/util';
Page({
    data: {
        loading: false,
        dialogVisible: false,
        carIndex: 0,
        cateId: 0,
        tempCateId: 0,
        cateName: '',
        categories: [],
        carNumbers: [],
        form: {
            store_id: 0,
            car_number: '',
            category: '',
            mobile: '',
            contact: '',
            traveled: '',
            reserve_time: ''
        },
        errorMsg: '',
        policy: {},
        searchForm: {
            merchant_id: 0,
            store_id: 0
        }
    },
    /**
     * 获取服务分类
     */
    getCategories: function() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        getRequest('weapp/category', this.data.searchForm, false).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                let cates = res.data.data;
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
        getRequest('weapp/reserverule', this.data.searchForm, false).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    policy: res.data
                });
            } else {
                this.setData({
                    policy: {}
                });
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
        this.setData({
            carIndex: index,
            'form.car_number': this.data.carNumbers[index]
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
        let errMsg = this.validate();
        if (errMsg !== '') {
            showTopTips(this, errMsg);
        } else {
            wx.showLoading({
                title: '提交请求中',
                mask: true
            });
            postRequest('weapp/addreserve', this.data.form).then(res => {
                wx.hideLoading();
                if (res.errcode === 0) {
                    let reservationData = JSON.stringify(res.data);
                    wx.navigateTo({
                        url: 'detail?reservationData=' + reservationData
                    });
                } else {
                    confirmMsg('提示', res.errmsg, false, () => {
                        wx.navigateBack({
                            delta: 2
                        });
                    });
                }
            });
        }
    },
    /**
     * 获取输入框的值
     */
    getInputValue: function(e) {
        let field = e.currentTarget.dataset.name,
            value = e.detail.value,
            prop = 'form.' + field;
        this.setData({
            [prop]: value
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
        return this.data.categories.findIndex(item => {
            return id == item.id;
        });
    },
    /**
     * 选择服务分类
     */
    chooseCategory: function() {
        let id = this.data.tempCateId == 0 ? this.data.cateId : this.data.tempCateId;
        let index = this.findCateIndex(id);
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
        const memberData = JSON.parse(options.memberData);
        const carNumber = !!userData ? userData.user_data.default_car : '';
        this.setData({
            'form.store_id': memberData.store_id,
            'form.merchant_id': memberData.merchant_id,
            'form.car_number': carNumber,
            'form.mobile': !!userData ? userData.user_data.mobile : '',
            'form.contact': !linkman ? '' : linkman,
            carNumbers: !!userData ? userData.user_data.car : [],
            searchForm: {
                merchant_id: memberData.merchant_id,
                store_id: memberData.store_id
            }
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
