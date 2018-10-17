module.exports = (payArgs, succeed, fail) => {
    wx.requestPayment({
        timeStamp: payArgs.timeStamp + '',
        nonceStr: payArgs.nonceStr,
        package: payArgs.package,
        signType: payArgs.signType,
        paySign: payArgs.paySign,
        success: res => {
            typeof succeed === 'function' && succeed(res);
        },
        fail: res => {
            typeof fail === 'function' && fail(res);
        }
    });
};