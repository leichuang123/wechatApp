import api from '../../utils/api';
import { openLocation, makePhoneCall } from '../../utils/wx-api';
Page({
    data: {
        loading: true,
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        storeInfo: {},
        serviceType: 'wash',
        memberForm: {
            store_id: 0,
            store_name: '',
            merchant_id: 0,
            isRegistered: false
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
        api.getRequest('weapp/storedetail', this.data.storeForm, false).then(res => {
            this.setData({ loading: false });
            if (res.errcode === 0) {
                this.setData({
                    storeInfo: res.data,
                    'memberForm.store_name': res.data.store_name
                });
            }
        });
    },
    /**
     * 定位
     */
    openLocation: function() {
        let store = this.data.storeInfo,
            latitude = parseFloat(store.store_lati),
            longitude = parseFloat(store.store_long);

        let params = {
            latitude: latitude,
            longitude: longitude,
            scale: 18,
            name: store.store_name,
            address: store.store_address
        };
        openLocation(params);
    },
    /**
     * 跳转到服务购买页面
     */
    gotoGoodsList: function() {
        let memberData = this.data.memberForm;
        memberData.longitude = this.data.storeForm.longitude;
        memberData.latitude = this.data.storeForm.latitude;
        memberData = JSON.stringify(memberData);
        wx.navigateTo({
            url: '/pages/goods-list/goods-list?memberData=' + memberData
        });
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
        const memberData = JSON.stringify(this.data.memberForm);
        if (this.data.memberForm.isRegistered) {
            wx.navigateTo({
                url: '/pages/queue/add?memberData=' + memberData
            });
        } else {
            this.gotoRegister();
        }
    },
    /**
     * 跳转到预约页面
     */
    gotoReservation: function() {
        const memberData = JSON.stringify(this.data.memberForm);
        if (this.data.memberForm.isRegistered) {
            wx.navigateTo({
                url: '/pages/reservation/add?memberData=' + memberData
            });
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
            'memberForm.store_id': storeData.storeId,
            'memberForm.isRegistered': !!userData ? userData.isRegist : false,
            'memberForm.merchant_id': storeData.merchantId
        });
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.getStoreInfo();
    }
});
