import api from '../../utils/api';
import { confirmMsg, showLoading } from '../../utils/util';
import { getLocation } from '../../utils/wx-api';
const app = getApp();
Page({
    data: {
        couponDialogVisible: false,
        city: '',
        queues: [],
        reservations: [],
        unreceivedCoupons: [],
        bmsWeappStoreInfo: {
            store_id: '',
            merchant_id: '',
            oem_id: '',
            store_name: '',
            distance: ''
        },
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        weappList:[]
    },
    //获取banner
    getBannerList:function(merchant_id){
        let params={
            merchant_id:merchant_id,
            position:'homepage'
        };
        api.get('/weapp/ad/get-weapp-list', params, false).then(res => {
             if(res.errcode==0){
                 this.setData({
                    weappList:res.data
                 })
             }
        })
    },
    //点击banner跳转商品详情
    clickPic:function(row){
        if(!row.currentTarget.dataset.item.jump_goods_page){
             return;
        }
        wx.navigateTo({
            url: '../../promotion/pages/mallDetail/mallDetail?goods_id=' + row.currentTarget.dataset.item.goods_id
        });
    },
    /**
     * 获取首页信息
     */
    getIndexInfo: function() {
        let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
        let params = {
            store_id: bmsWeappStoreInfo.store_id
        };
        api.get('weapp/indexinfo', params, false).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    queues: !res.data.queues ? [] : res.data.queues,
                    reservations: !res.data.reservations ? [] : res.data.reservations,
                    unreceivedCoupons: !res.data.unreceivedCoupons ? [] : res.data.unreceivedCoupons.data,
                    couponDialogVisible: !!res.data.unreceivedCoupons && res.data.unreceivedCoupons.data.length > 0
                });
                wx.setStorageSync('userData', res.data.userData);
                this.getBannerList(bmsWeappStoreInfo.merchant_id);
            } else {
                console.log(res.errmsg);
            }
        });
    },
    /**
     * 定位
     */
    getLocation: function() {
        getLocation({
            type: 'wgs84'
        })
            .then(res => {
                let locationInfo = {
                    latitude: res.latitude,
                    longitude: res.longitude
                };
                this.getLocationInfo(locationInfo);
            })
            .catch(res => {
                let me = this;
                wx.showModal({
                    content: '请您开启手机GPS定位',
                    confirmText: '我已开启',
                    confirmColor: '#e60103',
                    success(res) {
                        if (res.confirm) {
                            wx.reLaunch({
                                url: '/pages/index/index'
                            });
                        } else if (res.cancel) {
                            me.getLocationInfo();
                            wx.setStorageSync('locationInfo', app.globalData.defaultLocation);
                        }
                    }
                });
            });
    },
    getLocationInfo: function(locationInfo) {
        showLoading();
        api.get('weapp/getcityinfo', locationInfo, false).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                if (locationInfo) {
                    const selectedCity = wx.getStorageSync('selectedCity');
                    const locatedCity = res.data.ad_info.city;
                    if (locatedCity !== selectedCity.name) {
                        const content = '您当前的位置为' + locatedCity + '，是否切换到当前城市';
                        confirmMsg(
                            '',
                            content,
                            true,
                            () => {
                                this.setData({
                                    city: locatedCity
                                });
                                wx.setStorageSync('selectedCity', {
                                    name: locatedCity,
                                    code: locationInfo.city_code
                                });
                            },
                            () => {
                                this.setData({
                                    city: !selectedCity ? '请选择' : selectedCity.name
                                });
                            }
                        );
                    }
                    locationInfo.adcode = res.data.ad_info.adcode;
                    locationInfo.city_code = res.data.ad_info.city_code.substring(res.data.ad_info.nation_code.length);
                    locationInfo.city = res.data.ad_info.city;
                    locationInfo.district = res.data.ad_info.district;
                    wx.setStorageSync('locationInfo', locationInfo);
                }
                //储存定位获取的最近的门店信息
                let bmsWeappStoreInfo = res.data.store_info;
                this.setData({
                    bmsWeappStoreInfo: bmsWeappStoreInfo
                });
                wx.setStorageSync('bmsWeappStoreInfo', bmsWeappStoreInfo);
            } else {
                confirmMsg('', res.errmsg, false);
            }
        });
    },
    onGetCoupon: function(e) {
        const params = JSON.stringify(e.currentTarget.dataset.item);
        this.updateRemindCount();
        wx.navigateTo({
            url: '/pages/my-coupon/share-detail?params=' + params
        });
    },
    updateRemindCount: function() {
        const ids = this.getUnreceivedCouponSendDetailIds();
        api.post('/weapp-coupon/update-remind-count', { id: ids }).then(res => {
            if (res.errcode !== 0) {
                console.log(res.errmsg);
            }
        });
    },
    getUnreceivedCouponSendDetailIds: function() {
        return this.data.unreceivedCoupons.map(val => val.id);
    },
    /**
     * 关闭优惠券领取提醒框
     *
     * @param {event} e
     */
    closeCouponDialog: function(e) {
        this.setData({
            couponDialogVisible: false
        });
        this.updateRemindCount();
    },
    initData: function() {
        this.setData({
            couponDialogVisible: false,
            queues: [],
            reservations: [],
            unreceivedCoupons: []
        });
        if (!app.globalData.sessionKey) {
            app.doLoginCallBack = sessionKey => {
                wx.setStorageSync('sessionKey', sessionKey);
                this.getIndexInfo();
            };
        } else {
            this.getIndexInfo();
        }
        const selectedCity = wx.getStorageSync('selectedCity');
        this.setData({
            city: !selectedCity ? '请选择' : selectedCity.name
        });
        if (this.data.city.length > 4) {
            this.setData({
                city: this.data.city.substring(0, 3) + '...'
            });
        }
    },
    //选择门店
    selectStore() {
        wx.navigateTo({
            url: '/pages/store-list/store-list'
        });
    },
    //股东申请
    joinGuDong: function() {
        showLoading();
        //判断用户是否注册股东申请
        api.post('/weapp/holder-application-info')
            .then(res => {
                wx.hideLoading();
                if (res.errcode == 0) {
                    wx.navigateTo({
                        url: '../../promotion/pages/shareholders/shareholders'
                    });
                    return;
                }
                if (res.errcode == '1022') {
                    wx.navigateTo({
                        url: '../../promotion/pages/shareholders/shareholders?type=' + true
                    });
                    return;
                }
                confirmMsg('', res.errmsg, false);
            })
            .catch(() => {
                wx.hideLoading();
            });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        //首页首次进入
        if (options.from !== 'list') {
            this.getLocation();
            return;
        }
        //从选择门店选择门店后进入
        if (options.from == 'list') {
            let bmsWeappStoreInfo = wx.getStorageSync('bmsWeappStoreInfo');
            if (!bmsWeappStoreInfo) {
                this.getLocation();
                return;
            }
            this.setData({
                bmsWeappStoreInfo: bmsWeappStoreInfo
            });
        }
    },
    onShow: function() {
        this.initData();
    }
});
