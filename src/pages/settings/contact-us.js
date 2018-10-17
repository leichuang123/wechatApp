Page({
    data: {
        phoneNumber: '027-59613798',
    },
    /**
     * 拨打电话
     */
    call: function (e) {
        wx.makePhoneCall({
            phoneNumber: this.data.phoneNumber,
            success: function (res) {
                console.log('拨打成功');
            },
            fail: function (res) {
                console.log('拨打失败');
            }
        })
    }
})