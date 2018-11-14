import api from '../../utils/api';
import { toastMsg, confirmMsg } from '../../utils/util';
const app = getApp();
const sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        sliderWidth: sliderWidth,
        tabs: ['待服务', '已服务', '无效'],
        activeIndex: 0,
        reservations: [],
        form: {
            type: 1
        }
    },
    /**
     * 切换tab
     */
    tabClick: function(e) {
        let index = e.currentTarget.id;
        if (index == this.data.activeIndex) {
            return;
        }
        let reserveState = e.currentTarget.dataset.state;
        this.setData({
            activeIndex: index,
            'form.type': reserveState,
            reservations: [],
            loadingVisible: true,
            hasData: true,
            sliderOffset: e.currentTarget.offsetLeft
        });
        this.getReservations();
    },
    /**
     * 获取我的预约列表
     */
    getReservations: function() {
        api.get('weapp/myreserve', this.data.form).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    reservations: res.data,
                    loadingVisible: false
                });
                return;
            }
            this.setData({
                loadingVisible: false,
                hasData: false,
                reservations: []
            });
        });
    },
    /**
     * 打电话
     */
    call: function(e) {
        let tel = e.currentTarget.dataset.tel;
        wx.makePhoneCall({
            phoneNumber: tel,
            success: function() {
                console.log('拨打成功');
            },
            fail: function() {
                console.log('拨打失败');
            }
        });
    },
    /**
     * 取消预约
     */
    cancelReservation: function(id) {
        api.post('weapp/cancelreserve', { id: id }).then(res => {
            if (res.errcode === 0) {
                toastMsg('取消成功!', 'success', 1000, () => {
                    this.getReservations();
                });
            } else {
                confirmMsg('', res.errmsg, false);
            }
        });
    },
    /**
     * 取消预约提示
     */
    onCancelReservation: function(e) {
        confirmMsg('', '确定要取消该预约吗', true, () => {
            this.cancelReservation(e.currentTarget.id);
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            sliderLeft: (app.globalData.windowWidth / this.data.tabs.length - sliderWidth) / 2,
            sliderOffset: (app.globalData.windowWidth / this.data.tabs.length) * this.data.activeIndex
        });
        this.getReservations();
    }
});
