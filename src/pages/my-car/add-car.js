import { confirmMsg, isCarNumber } from '../../utils/util';
Page({
    data: {
        keyboardVisible: false,
        carNumber: '',
    },
    /**
   * 显示键盘
   */
    showKeyboard: function () {
        this.setData({
            keyboardVisible: true,
        });
    },
    /**
     * 隐藏键盘
     */
    hideKeyboard: function (e) {
        this.setData({
            keyboardVisible: e.detail.keyboardVisible
        });
    },
    /**
     * 获取车牌号
     */
    getCarNumber: function (e) {
        this.setData({
            carNumber: e.detail.carNumber
        });
    },
    /**
     * 跳转到车品牌页面
     */
    gotoCars: function (e) {
        if (!isCarNumber(this.data.carNumber)) {
            confirmMsg('提示', '请填写有效的车牌号', false);
            return;
        }
        wx.setStorageSync('car', { car_number: this.data.carNumber, action: 'add' });
        wx.navigateTo({
            url: '/pages/cars/cars'
        });
    },
    /**
    * 生命周期函数--监听页面加载
    */
    onLoad: function (options) {
    },
})