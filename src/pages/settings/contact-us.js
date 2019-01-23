import api from '../../utils/api';
import {
    showLoading
} from '../../utils/util';
const app = getApp();

Page({
    data: {
        AUTH_TYPE_OEM:1,
        contactInfo: {},
    },
    /**
     * 拨打电话
     */
    call: function(e) {
        if (!this.data.contactInfo.service_hotline) {
            return;
        }
        wx.makePhoneCall({
            phoneNumber: this.data.contactInfo.service_hotline,
            success: function(res) {
                console.log('拨打成功');
            },
            fail: function(res) {
                console.log('拨打失败');
            }
        })
    },
    getContactInfo: function() {
        const authType = app.globalData.extConfig.auth_type;
        const params = {
            type: authType === this.data.AUTH_TYPE_OEM ? 'oem' : 'merchant',
            id: app.globalData.extConfig.auth_related_id || 1,
        };
        showLoading();
        api.get('oem-public/get-other-setting', params).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({
                    contactInfo: res.data,
                });
            }
        });
    },
    onLoad: function() {
        this.getContactInfo();
    }
})