import api from '../../utils/api';
import { toastMsg, confirmMsg, showLoading } from '../../utils/util';
const app = getApp();
const sliderWidth = 144; // 需要设置slider的宽度，用于计算中间位置
Page({
    /**
     * 页面的初始数据
     */
    data: {
        sliderOffset: 0,
        sliderLeft: 0,
        sliderWidth: sliderWidth,
        tabs: [{ name: '我的驾驶证', value: 0 }, { name: '我的车辆', value: 1 }],
        form: {
            type: 0
        }
    },
    switchTab: function(e) {
        const index = e.currentTarget.id;
        if (index == this.data.form.type) {
            return;
        }
        console.log(index);
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            'form.type': index
        });
    },
    gotoEditPage: function(e) {
        // const item = e.currentTarget.dataset.item;
        // console.log(item);
        // const params = JSON.stringify({
        //     id: item.id || 0,
        //     remind_type: item.remind_type,
        //     expire_time_type: item.expire_time_type,
        //     car_number: item.car_number,
        //     car_log: item.car_log,
        //     car_name: item.car_name
        // });
        wx.navigateTo({
            url: 'edit'//?params=' + params
        });
    },
    onDelete: function(e) {
        const item = e.currentTarget.dataset.item;
        const params = {
            id: item.id,
            remind_type: item.remind_type
        };
        confirmMsg('', '确定要删除吗', true, () => {
            this.deleteRemiding(params);
        });
    },
    deleteRemiding: function(params) {
        showLoading();
        api.post('weapp/delete-reminding', params)
            .then(res => {
                if (res.errcode == 0) {
                    toastMsg('删除成功', 'success');
                } else {
                    confirmMsg('', res.errmsg, false);
                }
            })
            .finally(() => {
                wx.hideLoading();
            });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            sliderLeft: (app.globalData.windowWidth / this.data.tabs.length - sliderWidth) / 2,
            sliderOffset: (app.globalData.windowWidth / this.data.tabs.length) * options.type
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {},

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {},

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {}
});
