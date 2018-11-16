import { get } from '../../utils/api';
import WxParse from '../../assets/plugins/wxParse/wxParse';
import { confirmMsg, getUrlArgs, showLoading } from '../../utils/util';
import {
    getSetting,
    saveImageToPhotosAlbum,
    makePhoneCall,
    downloadFile,
    openLocation,
    authorize
} from '../../utils/wx-api';
Page({
    data: {
        imgVisible: false,
        goods: {},
        store: {},
        evaluations: [],
        sharingImage: '',
        form: {
            related_id: 0,
            related_type: 0,
            merchant_id: 0,
            store_id: 0,
            user_id: 0
        }
    },
    /**
     * 获取商品详情
     */
    getDetail: function() {
        showLoading();
        get('weapp/store-goods-detail', this.data.form, false)
            .then(res => {
                wx.hideLoading();
                if (res.errcode === 0) {
                    this.setData({
                        goods: res.data.goods,
                        store: res.data.store,
                        evaluations: res.data.evaluations.data
                    });
                    const detail = res.data.goods.contents;
                    const that = this;
                    WxParse.wxParse('detail', 'html', detail, that, 15);
                }
            })
            .catch(() => {
                wx.hideLoading();
            });
    },
    /**
     * 跳转到评价列表
     */
    gotoEvaluationList: function() {
        wx.navigateTo({
            url: 'evaluation-list?storeId=' + this.data.store.store_id
        });
    },
    /**
     * 跳转到首页
     */
    gotoIndex: function() {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },
    /**
     * 跳转到支付页面
     */
    gotoPay: function() {
        const params = JSON.stringify({
            merchant_id: this.data.store.merchant_id,
            store_id: this.data.store.store_id,
            store_name: this.data.store.store_name,
            goods_id: this.data.goods.related_id,
            money: this.data.goods.price,
            goods_name: this.data.goods.goods_name,
            category: this.data.goods.related_type
        });
        wx.navigateTo({ url: '../payment/payment?params=' + params });
    },
    /**
     * 跳转到注册页面
     */
    gotoRegister: function() {
        const params = JSON.stringify({ userId: this.form.user_id, recommendType: 4 }); //0无1提供商2顾问3门店4用户
        wx.redirectTo({
            url: '/pages/register/register?params=' + params
        });
    },
    onGotoPay: function() {
        const userData = wx.getStorageSync('userData');
        if (!!userData && userData.registered) {
            this.gotoPay();
        } else {
            this.gotoRegister();
        }
    },
    /**
     * 定位
     */
    openLocation: function() {
        openLocation({
            latitude: parseFloat(this.data.store.store_lati),
            longitude: parseFloat(this.data.store.store_long),
            scale: 18,
            name: this.data.store.store_name,
            address: this.data.store.store_address
        });
    },
    /**
     * 打电话
     */
    call: function(e) {
        makePhoneCall({ phoneNumber: e.currentTarget.dataset.tel })
            .then(res => {
                console.log('拨打成功');
            })
            .catch(() => {
                console.log('拨打失败');
            });
    },
    /**
     * 生成分享图
     */
    generateSharingImage: function() {
        showLoading('图片生成中');
        get('weapp/share-goods-image', this.data.form, false).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({
                    sharingImage: res.data,
                    imageVisible: true
                });
                return;
            }
            this.setData({
                sharingImage: ''
            });
            confirmMsg('', '图片生成失败', false);
        });
    },
    /**
     * 保存图片到相册
     */
    saveImageToPhotosAlbum: function(tempFilePath) {
        saveImageToPhotosAlbum({ filePath: tempFilePath })
            .then(res => {
                wx.hideLoading();
                this.setData({ imageVisible: false });
                wx.showModal({
                    title: '成功保存图片',
                    content: '已成功为您保存图片到手机相册，请自行前往朋友圈分享',
                    showCancel: false,
                    confirmText: '知道了',
                    success: res => {}
                });
            })
            .catch(res => {
                wx.hideLoading();
                confirmMsg('保存出错', res.errMsg, false);
            });
    },

    /**
     * 下载图片
     */
    downloadImage: function() {
        showLoading('正在保存图片');
        downloadFile({ url: this.data.sharingImage }).then(res => {
            if (res.statusCode === 200) {
                const tempFilePath = res.tempFilePath;
                getSetting().then(res => {
                    if (!res.authSetting['scope.writePhotosAlbum']) {
                        authorize({ scope: 'scope.writePhotosAlbum' })
                            .then(res => {
                                this.saveImageToPhotosAlbum(tempFilePath);
                            })
                            .catch(res => {
                                wx.hideLoading();
                                confirmMsg('授权失败', res.errMsg, false);
                            });
                    } else {
                        this.saveImageToPhotosAlbum(tempFilePath);
                    }
                });
            }
        });
    },
    /**
     * 保存图片
     */
    saveImage: function() {
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
    gotoStoreDetail: function() {
        const params = JSON.stringify({
            merchant_id: this.data.store.merchant_id,
            store_id: this.data.store.store_id
        });
        wx.navigateTo({
            url: '/pages/store-list/detail?params=' + params
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let params = null;
        if (options.q) {
            params = getUrlArgs(decodeURIComponent(options.q));
        } else if (options.params) {
            params = JSON.parse(options.params);
        }

        const userData = wx.getStorageSync('userData');
        this.setData({
            'form.related_id': params.related_id,
            'form.related_type': params.related_type,
            'form.merchant_id': params.merchant_id,
            'form.store_id': params.store_id,
            'form.user_id': !!userData && !!userData ? userData.id : 0
        });
        this.getDetail();
    },
    /**
     * 分享
     */
    onShareAppMessage: function() {
        const params = JSON.stringify({
            related_id: this.data.form.related_id,
            merchant_id: this.data.form.merchant_id,
            store_id: this.data.form.store_id,
            user_id: this.data.form.user_id
        });
        return {
            title: '促销活动--' + this.data.goods.related_name,
            path: '/promotion/pages/goods-detail/index?params=' + params
        };
    }
});
