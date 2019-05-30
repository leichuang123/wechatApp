import api from '../../../utils/api';
import { confirmMsg, isMobile, toastMsg, showLoading } from '../../../utils/util';
Page({
    data: {
        show1: true,
        show2: false,
        contact: [],
        type: [],
        phone: '',
        relation_id: ''
    },
    //获取原先关系列表
    getList: function() {
        const self = this;
        const param = {
            sessionKey: wx.getStorageSync('sessionKey')
        };
        api.get('weapp-obd-exception/user-sos-contact', param).then(res => {
            if (res.errcode != 0) {
                confirmMsg('', res.errmsg, false);
                return;
            }
            self.setData({
                contact: res.data
            });
        });
    },
    //获取紧急联系人关系列表
    getType: function() {
        const self = this;
        api.get('weapp-obd-exception/sos-relation-list').then(res => {
            if (res.errcode != 0) {
                confirmMsg('', res.errmsg, false);
                return;
            }
            self.setData({
                type: res.data
            });
        });
    },
    //电话号码赋值
    checkboxChange: function(e) {
        this.setData({
            phone: e.detail.value
        });
    },
    //添加
    sure: function() {
        this.setData({
            show1: false,
            show2: true
        });
    },
    //取消添加
    cel: function() {
        wx.navigateBack({
            delta: 1
        });
    },
    //选择关系
    selectType: function(e) {
        this.setData({
            relation_id: e.currentTarget.dataset.item.id
        });
    },
    //是否删除
    del: function(e) {
        const id = e.target.id;
        confirmMsg('提示', '是否删除该联系人', true, () => {
            this.suredel(id);
        });
    },
    //删除
    suredel: function(id) {
        const param = {
            contract_id: id
        };
        api.post('weapp-obd-exception/delete-sos-contact', param).then(res => {
            if (res.errcode != 0) {
                confirmMsg('', res.errmsg, false);
                return;
            }
            toastMsg(res.errmsg, 'success', 1000, () => {
                this.getList();
            });
        });
    },
    //取消保存联系人
    noadd: function() {
        this.setData({
            show1: true,
            show2: false
        });
    },
    //保存联系人
    add: function() {
        if (this.data.phone == '') {
            confirmMsg('', '请填写手机号码', false);
            return;
        }
        if (this.data.relation_id == '') {
            confirmMsg('', '请选择对应关系', false);
            return;
        }
        if (!isMobile(this.data.phone)) {
            confirmMsg('', '手机号码格式不正确', false);
            return;
        }
        showLoading();
        const self = this;
        const param = {
            relation_id: self.data.relation_id,
            phone: self.data.phone
        };
        api.post('weapp-obd-exception/add-sos-contact', param).then(res => {
            if (res.errcode != 0) {
                confirmMsg('', res.errmsg, false);
                return;
            }
            wx.hideLoading();
            toastMsg(res.errmsg, 'success', 1000, () => {
                self.setData({
                    show1: true,
                    show2: false
                });
                this.getList();
            });
        });
    },
    onLoad: function(options) {
        this.getList();
        this.getType();
    },
    onShow: function() {}
});
