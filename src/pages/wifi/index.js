import { get } from '../../utils/api';
import { setClipboardData } from '../../utils/wx-api';
import { toastMsg, showLoading } from '../../utils/util';
Page({
    data: {
        account: null
    },
    getWifiAccount: function(storeId) {
        showLoading();
        get('/weapp/get-wifi-account', { store_id: storeId }).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({ account: res.data });
            }
        });
    },
    copyPassword: function() {
        if (!this.data.account) {
            return;
        }
        setClipboardData({ data: this.data.account.wifi_pwd }).then(() => {
            toastMsg('复制成功', 'success');
        });
    },
    onLoad: function(options) {
        this.getWifiAccount(options.storeId);
    }
});
