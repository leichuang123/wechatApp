import api from '../../utils/api';
import { openLocation, makePhoneCall } from '../../utils/wx-api';
import { showLoading } from '../../utils/util';
Page({
    data: {
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        storeInfo: {},
        serviceType: 'queue',
        form: {
            store_id: 0,
            store_name: '',
            merchant_id: 0,
            registered: false
        },
        storeForm: {
            storeId: 0,
            merchantId: 0,
            fromPage: '',
            latitude: 0,
            longitude: 0
        }
    },
    /**
     * 打电话
     */
    call: function(e) {
        let tel = e.currentTarget.dataset.tel;
        makePhoneCall({ phoneNumber: tel })
            .then(res => {
                console.log('拨打成功');
            })
            .catch(() => {
                console.log('拨打失败');
            });
    },
    /**
     * 获取门店详情
     */
    getStoreInfo: function() {
        showLoading();
        api.get('weapp/storedetail', this.data.storeForm, false).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({
                    storeInfo: res.data,
                    'form.store_name': res.data.store_name
                });
            }
        });
    },
    /**
     * 定位
     */
    openLocation: function() {
        openLocation({
            latitude: parseFloat(this.data.storeInfo.store_lati),
            longitude: parseFloat(this.data.storeInfo.store_long),
            scale: 18,
            name: this.data.storeInfo.store_name,
            address: this.data.storeInfo.store_address
        });
    },
    /**
     * 跳转到服务购买页面
     */
    gotoGoodsList: function() {
        const params = JSON.stringify({
            store_id: this.data.form.store_id,
            store_name: this.data.form.store_name,
            merchant_id: this.data.form.merchant_id,
            registered: this.data.form.registered,
            longitude: this.data.storeForm.longitude,
            latitude: this.data.storeForm.latitude
        });
        wx.navigateTo({ url: '/pages/goods/index?params=' + params });
    },
    /**
     * 跳转到注册页面
     */
    gotoRegister: function() {
        wx.navigateTo({
            url: '/pages/register/register'
        });
    },
    /**
     * 跳转到排队页面
     */
    gotoQueue: function() {
        if (this.data.form.registered) {
            wx.navigateTo({ url: '/pages/queue/add?params=' + JSON.stringify(this.data.form) });
        } else {
            this.gotoRegister();
        }
    },
    /**
     * 跳转到预约页面
     */
    gotoReservation: function() {
        if (this.data.form.registered) {
            wx.navigateTo({ url: '/pages/reservation/add?params=' + JSON.stringify(this.data.form) });
        } else {
            this.gotoRegister();
        }
    },
    /**
     * 跳转到门店简介或评价页面
     */
    gotoStoreEvaluation: function(e) {
        let storeData = this.data.storeForm;
        storeData.type = e.currentTarget.dataset.type;
        storeData = JSON.stringify(storeData);
        wx.navigateTo({
            url: '/pages/store-list/profile?storeData=' + storeData
        });
    },
    /**
     * 跳转到店内促销页面
     */
    gotoStorePromotion: function() {
        const params = JSON.stringify({
            merchant_id: this.data.storeInfo.merchant_id,
            store_id: this.data.storeInfo.store_id
        });
        wx.navigateTo({
            url: '../../promotion/pages/store-goods/index?params=' + params
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const storeData = JSON.parse(options.storeData);
        const userData = wx.getStorageSync('userData');
        this.setData({
            serviceType: storeData.fromPage,
            storeForm: storeData,
            'form.store_id': storeData.storeId,
            'form.registered': !!userData && userData.registered,
            'form.merchant_id': storeData.merchantId
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.getStoreInfo();
    }
});
