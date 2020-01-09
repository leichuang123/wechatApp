import { confirmMsg } from '../../../utils/util';
Page({
    data: {
        item: 'https://sh.huobanyc.com/images/weapp/shareholder_application.png',
        height: '',
        hasJoin: false
    },
    onReady() {},
    onLoad: function(options) {
        const phoneData = wx.getStorageSync('systemInfo');
        this.setData({
            height: phoneData.screenHeight
        });
        if (options.type) {
            this.setData({
                hasJoin: true
            });
        }
    },
    addSubmit: function() {
        if (this.data.hasJoin) {
            confirmMsg('', '您已经申请过啦！', false);
            return;
        }
        wx.navigateTo({
            url: './add'
        });
    }
});
