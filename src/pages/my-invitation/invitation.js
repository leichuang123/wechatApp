import { getRequest } from '../../utils/api';
import { confirmMsg } from '../../utils/util';
import { downloadFile, saveImageToPhotosAlbum, getSetting, authorize } from '../../utils/wx-api';

Page({
    data: {
        loading: true,
        qrCode: '',
        sharingImage: '',
        imageVisible: false,
        userId: 0
    },
    /**
     * 获取邀请二维码
     */
    getInviteQrCode: function() {
        getRequest('weapp/invite-qrcode', { userId: this.data.userId }).then(res => {
            this.setData({ loading: false });
            if (res.errcode === 0) {
                this.setData({ qrCode: res.data });
            }
        });
    },
    /**
     * 生成分享图
     */
    generateSharingImage: function() {
        wx.showLoading({
            title: '图片生成中',
            mask:true
        });
        getRequest('weapp/share-image').then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({
                    sharingImage: res.data,
                    imageVisible: true
                });
                return;
            }
            confirmMsg('', '生成图片失败', false);
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
        downloadFile({ url: this.data.sharingImage }).then(res => {
            if (res.statusCode === 200) {
                let tempFilePath = res.tempFilePath;
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
        wx.showLoading({
            title: '正在保存图片',
            mask:true
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
     * 跳转到首页
     */
    gotoIndex: function() {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },
    /**
     * 跳转到注册页面
     */
    gotoRegister: function() {
        let params = JSON.stringify({
            userId: this.data.userId,
            recommendType: 4 //0无1提供商2顾问3门店4用户
        });
        wx.redirectTo({
            url: '/pages/register/register?params=' + params
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let userData = wx.getStorageSync('userData'),
            userId = options.userId !== undefined ? options.userId : !!userData ? userData.user_data.id : 0;
        this.setData({ userId: userId });
        this.getInviteQrCode();
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        let userData = wx.getStorageSync('userData');
        let userId = !!userData ? userData.user_data.id : 0;
        return {
            title: '伙伴养车',
            path: '/pages/my-invitation/invitation?userId=' + userId
        };
    }
});