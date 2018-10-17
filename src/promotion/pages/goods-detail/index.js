import { getRequest } from '../../../utils/api';
import WxParse from '../../../assets/plugins/wxParse/wxParse';
import { confirmMsg } from '../../../utils/util';
import { getSetting, saveImageToPhotosAlbum, makePhoneCall, downloadFile, openLocation, authorize } from '../../../utils/wx-api';
const app=getApp();
Page({
    data: {
        loading: true,
        imgVisible: false,
        goodsDetail: {},
        storeDetail: {},
        evaluations: [],
        sharingImage: '',
        form: {
            id: 0,
            merchant_id:0,
            store_id: 0,
            user_id: 0
        },
        goodsForm: {
            goods_id: 0,
            money: 0,
            merchant_id: 0,
            store_id: 0,
            store_name: '',
            category: 0,
            goods_name: ''
        },

    },
    /**
     * 获取商品详情
     */
    getDetail: function() {
        this.setData({ loading: true });
        getRequest('weapp/promotion-detail', this.data.form, false).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    loading: false,
                    goodsDetail: res.data.goodsDetail,
                    storeDetail: res.data.storeDetail,
                    evaluations: res.data.storeEvaluationList.data
                });
                let detail = res.data.goodsDetail.contents;
                let that = this;
                WxParse.wxParse('detail', 'html', detail, that, 15);

            } else {
                this.setData({
                    loading: false,
                    goodsDetail: {},
                    storeDetail: {},
                    evaluations: []
                });
            }
        });
    },
    /**
     * 跳转到评价列表
     */
    gotoEvaluationList: function() {
        wx.navigateTo({
            url: 'evaluation-list?storeId=' + this.data.storeDetail.store_id,
        });
    },
    /**
     * 跳转到首页
     */
    gotoIndex: function() {
        wx.switchTab({
            url: '/pages/index/index',
        });
    },
    /**
     * 跳转到支付页面
     */
    gotoPay: function() {
        this.setData({
            'goodsForm.goods_id': this.data.goodsDetail.related_id,
            'goodsForm.money': this.data.goodsDetail.promotion_price,
            'goodsForm.merchant_id': this.data.goodsDetail.merchant_id,
            'goodsForm.store_id': this.data.goodsDetail.store_id,
            'goodsForm.store_name': this.data.storeDetail.store_name,
            'goodsForm.goods_name': this.data.goodsDetail.related_name,
            'goodsForm.category': this.data.goodsDetail.category,
        });
        wx.navigateTo({
            url: '../payment/payment?params=' + JSON.stringify(this.data.goodsForm),
        });
    },
    /**
     * 跳转到注册页面
     */
    gotoRegister: function() {
        let params = JSON.stringify({
            userId: this.form.user_id,
            recommendType: 4 //0无1提供商2顾问3门店4用户
        });
        wx.redirectTo({
            url: '../../../pages/register/register?params=' + params
        });
    },
    onGotoPay: function() {
        let userData = wx.getStorageSync('userData');
        if (!!userData && userData.isRegist) {
            this.gotoPay();
        } else {
            this.gotoRegister();
        }
    },
    /**
     * 定位
     */
    openLocation: function() {
        let store = this.data.storeDetail,
            latitude = parseFloat(store.store_lati),
            longitude = parseFloat(store.store_long);
        let params = {
            latitude: latitude,
            longitude: longitude,
            scale: 18,
            name: store.store_name,
            address: store.store_address,
        }
        openLocation(params);
    },
    /**
     * 打电话
     */
    call: function(e) {
        let tel = e.currentTarget.dataset.tel;
        makePhoneCall({ phoneNumber: tel }).then(res => {
            console.log('拨打成功');
        }).catch(() => {
            console.log('拨打失败');
        });
    },
    /**
     * 生成分享图
     */
    generateSharingImage: function() {
        wx.showLoading({
            title: '图片生成中',
        });
        getRequest('weapp/share-goods-image', this.data.form, false).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({
                    sharingImage: res.data,
                    imageVisible: true
                });
                return;
            }
            this.setData({
                sharingImage: '',
            });
            confirmMsg('', '图片生成失败', false);
        });
    },
    /**
     * 保存图片到相册
     */
    saveImageToPhotosAlbum: function(tempFilePath) {
        saveImageToPhotosAlbum({ filePath: tempFilePath }).then(res => {
            wx.hideLoading();
            this.setData({ imageVisible: false });
            wx.showModal({
                title: '成功保存图片',
                content: '已成功为您保存图片到手机相册，请自行前往朋友圈分享',
                showCancel: false,
                confirmText: '知道了',
                success: (res) => {

                }
            });
        }).catch(res => {
            wx.hideLoading();
            confirmMsg('保存出错', res.errMsg, false);
        });
    },

    /**
     * 下载图片
     */
    downloadImage: function() {
        downloadFile({ url: this.data.sharingImage }).then(res => {
            if (res.statusCode === 200) {
                let tempFilePath = res.tempFilePath;
                getSetting().then(res => {
                    if (!res.authSetting['scope.writePhotosAlbum']) {
                        authorize({ scope: 'scope.writePhotosAlbum' }).then(res => {
                            this.saveImageToPhotosAlbum(tempFilePath);
                        }).catch(res => {
                            wx.hideLoading();
                            confirmMsg('授权失败', res.errMsg, false);
                        });
                    } else {
                        this.saveImageToPhotosAlbum(tempFilePath);
                    }
                });
            }
        })
    },
    /**
     * 保存图片
     */
    saveImage: function() {
        wx.showLoading({
            title: '正在保存图片',
        });
        this.downloadImage();
    },
    /**
     * 隐藏图片
     */
    hideImage: function() {
        this.setData({
            imageVisible: false,
            sharingImage: ''
        });
    },
    /**
     * 跳转到店内促销详情页
     */
    gotoStorePromotion: function() {
        let params = JSON.stringify({
            merchant_id: this.data.storeDetail.merchant_id,
            store_id: this.data.storeDetail.store_id
        });
        wx.navigateTo({
            url: '../store-goods/index?params=' + params,
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let params = JSON.parse(options.params),
            userData = wx.getStorageSync('userData'),
            userId = params.user_id !== undefined ? params.user_id : (!!userData ? userData.user_data.id : 0);
        this.setData({
            'form.id': params.id,
            'form.merchant_id': params.merchant_id,
            'form.store_id': params.store_id,
            'form.user_id': userId
        });
        this.getDetail();
    },
    /**
     * 分享
     */
    onShareAppMessage: function() {
        let userData = wx.getStorageSync('userData'),
            params = JSON.stringify({
                id: this.data.form.id,
                merchant_id: this.data.form.merchant_id,
                store_id: this.data.form.store_id,
                user_id: !!userData ? userData.user_data.id : 0
            });
        return {
            title: '促销活动--' + this.data.goodsDetail.related_name,
            path: '/promotion/pages/goods-detail/index?params=' + params
        }
    }
})