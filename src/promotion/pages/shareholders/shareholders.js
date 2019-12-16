
Page({
    data: {
        item: 'https://sh.huobanyc.com/images/weapp/shareholder_application.png',
        height: ''
    },
    onReady() {},
    onLoad: function(options) {
        const phoneData = wx.getStorageSync('systemInfo');
        this.setData({
            height: phoneData.screenHeight
        });
    },
    addSubmit: function() {
        wx.navigateTo({
            url: "./add"
          });
    },
});
