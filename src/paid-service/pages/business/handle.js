import { getRequest, postRequest } from '../../../utils/api';
import { uploadFileUrl } from '../../../config';
import { confirmMsg, showTopTips, isMobile, isCarNumber } from '../../../utils/util';
const app=getApp();
Page({
    data: {
        loading: true,
        takeChecked: false,
        postChecked: false,
        showTopTips: false,
        hasNeededData: true,
        errorMsg: '',
        carIndex: 0,
        noticeLength: 0,
        carNumbers: [],
        businessId: 0,
        businessForm: {},
        form: {
            user_id: '',
            business_id: '',
            car_number: '',
            contact: '',
            mobile: '',
            is_send_home: 'N',
            support_data_post: 'N',
            notice: '',
            customer_form: [],
            need_upload: [],
            attribute_id: [],
            user_type: 1, //1个人，2企业
            longitude: '',
            latitude: ''
        },
        //表单类型
        formTypes: {
            RADIO: 1,
            TEXT: 2,
            TEXTAREA: 3,
            NUMBER: 4,
            DATE: 5
        },
        customerForm: [],
        needUploadData: [],
        personUploadData: [],
        cropUploadData: [],
        personImageList: [],
        cropImageList: [],
        customerFormItemIndex: 999,
        uploadItemIndex: 999
    },
    /**
     * 获取手机号、联系人和备注
     */
    bindInput: function(e) {
        let value = e.detail.value,
            item = e.currentTarget.dataset.item,
            form = Object.assign({}, this.data.form);
        form[item] = value;
        this.setData({
            form: form,
            noticeLength: item === 'notice' ? value.length : 0
        });
    },
    /**
     * 切换单选项值
     */
    customerFormOptionChange: function(e) {
        let checkedIndex = e.detail.value,
            index = e.currentTarget.dataset.index,
            items = this.data.customerForm;
        items[index].checkedIndex = checkedIndex;
        items[index].value = this.data.businessForm.customer_form[index].options[checkedIndex];
        if (items[index].name === '车辆所属人') {
            this.setData({
                'form.user_type': checkedIndex == 0 ? 1 : 2
            });
        }
        this.setData({
            customerForm: items,
        });
    },
    /**
     * 改变日期类选项值
     */
    customerFormDateChange: function(e) {
        let value = e.detail.value,
            index = e.currentTarget.dataset.index,
            items = this.data.customerForm;
        items[index].value = value;
        this.setData({
            customerForm: items
        });
    },
    /**
     * 选择车牌号
     */
    carNumberChange: function(e) {
        let index = e.detail.value;
        this.setData({
            'form.car_number': this.data.carNumbers[index],
            carIndex: index
        });
    },
    /**
     * 过去输入框的值
     */
    customerFormInput: function(e) {
        let value = e.detail.value,
            index = e.currentTarget.dataset.index,
            items = this.data.customerForm;
        items[index].value = value;
        this.setData({
            customerForm: items
        });
    },
    /**
     * 改变属性值
     */
    attributeChange: function(e) {
        let pIndex = e.currentTarget.dataset.index,
            index = e.detail.value,
            attributes = this.data.businessForm.attribute,
            attribute = attributes[pIndex].children;
        let items = attribute.map((n, i) => {
            return Object.assign({}, n, {
                checked: i == index,
            });
        });
        attributes[pIndex].children = items;
        this.setData({
            'businessForm.attribute': attributes
        });
    },
    /**
     * 是否选择上门取件和资料是否邮寄
     */
    switchChange: function(e) {
        let switchType = e.currentTarget.dataset.type,
            value = e.detail.value;
        if (switchType === 'take') {
            if (this.data.form.support_data_post === 'Y') {
                confirmMsg('提示', '上门取件和资料邮寄最多选择一项', false);
                this.setData({
                    takeChecked: false
                });
                return;
            }
            this.setData({
                'form.is_send_home': value ? 'Y' : 'N',
                takeChecked: value
            });
            return;
        }
        if (this.data.form.is_send_home === 'Y') {
            confirmMsg('提示', '上门取件和资料邮寄最多选择一项', false);
            this.setData({
                postChecked: false
            });
            return;
        }
        this.setData({
            'form.support_data_post': value ? 'Y' : 'N',
            postChecked: value
        });
    },
    /**
     * 上传图片
     */
    uploadImages: function(params) {
        wx.uploadFile({
            url: uploadFileUrl,
            filePath: params.filePaths[params.i],
            name: 'img',
            success: res => {
                params.successUp++;
                console.log(res);
                if (res.statusCode === 413) {
                    confirmMsg('', '图片大小不能超过1M', false);
                    return;
                }
                let data = JSON.parse(res.data),
                    userType = this.data.form.user_type,
                    uploadDataType = userType == 1 ? 'personUploadData' : 'cropUploadData',
                    uploadData = userType == 1 ? this.data.personUploadData : this.data.cropUploadData;
                uploadData[params.index].attach.push(data.data.url);
                this.setData({
                    needUploadData: uploadData,
                    [uploadDataType]: uploadData
                });
            },
            fail: res => {
                params.failUp++;
            },
            complete: (res) => {
                params.i++;
                if (params.i === params.length) {
                    console.log('总共' + params.successUp + '张上传成功,' + params.failUp + '张上传失败！');
                } else {
                    this.uploadImages(params);
                }
            },
        })
    },
    /**
     * 选择图片
     */
    chooseImages: function(e) {
        let index = e.currentTarget.dataset.index;
        wx.chooseImage({
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            count: 2,
            success: res => {
                let params = {
                    index: index, //图片数组索引
                    successUp: 0, //上传成功张数
                    failUp: 0, //上传失败张数
                    length: res.tempFilePaths.length, //一次上传图片张数
                    i: 0, //上传图片索引
                    filePaths: res.tempFilePaths
                };
                let userType = this.data.form.user_type;
                let imageListType = userType == 1 ? 'personImageList' : 'cropImageList';
                let imageList = userType == 1 ? this.data.personImageList : this.data.cropImageList;
                imageList[index] = userType == 1 ? this.data.personImageList[index].concat(res.tempFilePaths) : this.data.cropImageList[index].concat(res.tempFilePaths);
                this.setData({
                    [imageListType]: imageList
                });
                this.uploadImages(params);
            }
        })
    },
    /**
     * 图片预览
     */
    previewImage: function(e) {
        let index = e.currentTarget.dataset.index,
            urls = this.data.form.user_type == 1 ? this.data.personImageList[index] : this.data.cropImageList[index];
        wx.previewImage({
            current: e.currentTarget.dataset.src,
            urls: urls
        })
    },
    /**
     * 初始化数据
     */
    initData: function(data) {
        let formData = data.customer_form,
            cropUploadData = data.need_upload.crop,
            personUploadData = data.need_upload.personal,
            customerForm = [],
            needUploadData = [],
            cropData = [],
            personData = [],
            cropImageList = [],
            personImageList = [];
        for (let i = 0, iLen = formData.length; i < iLen; i++) {
            let formItem = { id: formData[i].id, value: '', name: formData[i].name, checkedIndex: 999, valueLength: 0 };
            customerForm.push(formItem);
        }
        if (cropUploadData.length !== 0) {
            for (let k = 0, kLen = cropUploadData.length; k < kLen; k++) {
                let uploadItem = { id: cropUploadData[k].id, name: cropUploadData[k].name, attach: [] };
                cropData.push(uploadItem);
                cropImageList[k] = [];
            }
        }
        if (personUploadData.length !== 0) {
            for (let j = 0, jLen = personUploadData.length; j < jLen; j++) {
                let uploadItem = { id: personUploadData[j].id, name: personUploadData[j].name, attach: [] };
                personData.push(uploadItem);
                personImageList[j] = [];
            }
        }
        if (cropUploadData.length === 0 && personUploadData.length === 0) {
            this.setData({ hasNeededData: false });
        }

        this.setData({
            customerForm: customerForm,
            cropUploadData: cropData,
            personUploadData: personData,
            cropImageList: cropImageList,
            personImageList: personImageList
        });
    },
    /**
     * 删除图片
     */
    deleteImage: function(e) {
        let pIndex = e.currentTarget.dataset.pindex,
            index = e.currentTarget.dataset.index,
            userType = this.data.form.user_type,
            imageListType = userType == 1 ? 'personImageList' : 'cropImageList',
            uploadDataType = userType == 1 ? 'personUploadData' : 'cropUploadData',
            uploadData = userType == 1 ? this.data.personUploadData : this.data.cropUploadData,
            images = userType == 1 ? this.data.personImageList : this.data.cropImageList;
        images[pIndex].splice(index, 1);
        uploadData[pIndex].attach.splice(index, 1);
        this.setData({
            [imageListType]: images,
            [uploadDataType]: uploadData,
            needUploadData: uploadData
        });
    },
    /**
     * 获取业务办理需要填写的表单
     */
    getBusinessForm: function(id) {
        getRequest('weapp/business-form', { business_id: id }, false).then(res => {
            this.setData({ loading: false });
            if (res.errcode === 0) {
                this.setData({
                    businessForm: res.data,
                    loading: false
                });
                this.initData(res.data);
            }
        });
    },
    /**
     * 选择车牌号
     */
    changeCarNumber: function(e) {
        if (this.data.carIndex == e.detail.value) {
            return;
        }
        this.setData({
            carIndex: e.detail.value,
            'form.car_number': this.data.carNumbers[e.detail.value]
        });
    },
    /**
     * 拼接表单数据
     */
    generateFormData: function() {
        let attributes = this.data.businessForm.attribute,
            atributeIds = [];
        for (let i = 0, len = attributes.length; i < len; i++) {
            let items = attributes[i].children;
            for (let j = 0, jLen = items.length; j < jLen; j++) {
                if (items[j].checked) {
                    atributeIds.push(items[j].id);
                }
            }
        }
        this.setData({
            'form.customer_form': this.data.customerForm,
            'form.attribute_id': atributeIds,
            'form.need_upload': this.data.needUploadData
        });
    },
    /**
     * 提交表单
     */
    submitForm: function() {
        this.setData({ loading: true });
        wx.setStorageSync('linkman', this.data.form.contact);
        postRequest('weapp/business-save-form', this.data.form, false).then(res => {
            this.setData({ loading: false });
            if (res.errcode === 0) {
                let params = res.data.at_once;
                params.mail = res.data.mail;
                params.money = res.data.money;
                params.work_order_id = res.data.work_order_id;
                params.business_id = this.data.businessId;
                params.user_type = this.data.form.user_type;
                params.notice = this.data.form.notice;
                params.car_number = this.data.businessForm.need_car_number === 'Y' ? this.data.form.car_number : '';
                params = JSON.stringify(params);
                wx.navigateTo({
                    url: 'settlement?params=' + params,
                });
            }
        });
    },
    /**
     * 检查每个属性是否被选中
     */
    isAttributeChecked: function(element, index, array) {
        return !element.checked
    },
    /**
     * 检查客户填写资料是否为空
     */
    isCustomerFormItemEmpty: function(element, index, array) {
        this.setData({
            customerFormItemIndex: element.value === '' ? index : 999
        });
        return element.value === '';
    },
    /**
     * 检查上传资料是否为空
     */
    isFormItemUploaded: function(element, index, array) {
        this.setData({
            uploadItemIndex: element.attach.length > 0 ? 999 : index
        });
        return element.attach.length > 0;
    },
    /**
     * 表单验证
     */
    validateForm: function() {
        let attributes = this.data.businessForm.attribute,
            atributeIds = [],
            customerFormData = this.data.customerForm,
            uploadData = this.data.needUploadData;
        if (this.data.businessForm.need_car_number === 'Y' && !isCarNumber(this.data.form.car_number)) {
            return '请填写有效的车牌号';
        }
        if (this.data.form.contact === '') {
            return '请填写联系人';
        }
        if (!isMobile(this.data.form.mobile)) {
            return '请填写有效的手机号';
        }
        if (customerFormData.some(this.isCustomerFormItemEmpty)) {
            return '请填写' + customerFormData[this.data.customerFormItemIndex].name;
        }
        for (let i = 0, len = attributes.length; i < len; i++) {
            let items = attributes[i].children;
            if (items.every(this.isAttributeChecked)) {
                return '请选择' + attributes[i].name + '选项'
            }
        }
        if (uploadData.length === 0 && this.data.hasNeededData) {
            return '请上传相关资料'
        } else {
            if (!uploadData.every(this.isFormItemUploaded)) {
                return '请上传' + uploadData[this.data.uploadItemIndex].name;
            }
        }
        return '';
    },
    /**
     * 提交表单之前的操作
     */
    onFormSubmit: function() {
        let errMsg = this.validateForm();
        if (errMsg !== '') {
            showTopTips(this, errMsg);
            return;
        }

        this.generateFormData();
        setTimeout(() => {
            this.submitForm();
        }, 500);
    },
    /**
     * 返回上一页
     */
    goBack: function() {
        wx.navigateBack({
            delta: 1
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let linkman = wx.getStorageSync('linkman');
        let userData = wx.getStorageSync('userData');
        let carNumber = !!userData ? userData.user_data.default_car : '';
        this.setData({
            carNumbers: !!userData ? userData.user_data.car : [],
            businessId: options.id,
            'form.user_id': !!userData ? userData.user_data.id : '',
            'form.mobile': !!userData ? userData.user_data.mobile : '',
            'form.car_number': carNumber,
            'form.contact': linkman ? linkman : '',
            'form.business_id': options.id,
            'form.latitude': app.globalData.defaultLocation.latitude,
            'form.longitude': app.globalData.defaultLocation.longitude,
        });
        if (this.data.carNumbers.length > 0) {
            let index = this.data.carNumbers.findIndex(value => carNumber === value);
            this.setData({ carIndex: index });
        }
        this.getBusinessForm(options.id);
    }
})