import { get } from '../../utils/api';
import { confirmMsg, showLoading } from '../../utils/util';
import { downloadFile, saveImageToPhotosAlbum, getSetting, authorize } from '../../utils/wx-api';

Page({
    data: {
        qrCode: '',
        sharingImage: '',
        imageVisible: false,
        userId: 0
    },
    /**
     * 获取邀请二维码
     */
    getInviteQrCode: function() {
        showLoading();
        get('weapp/invite-qrcode', { userId: this.data.userId }).then(res => {
            wx.hideLoading();
            this.setData({ qrCode: res.errcode === 0 ? res.data : '' });
        });
    },
    /**
     * 生成分享图
     */
    generateSharingImage: function() {
        showLoading('图片生成中');
        get('weapp/share-image').then(res => {
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
        showLoading('正在保存图片');
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
        const params = JSON.stringify({
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
        const userData = wx.getStorageSync('userData');
        const userId = !!options.userId ? options.userId : (!!userData ? userData.id : 0);
        this.setData({ userId: userId });
        this.getInviteQrCode();
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        const userData = wx.getStorageSync('userData');
        const userId = !!userData ? userData.id : 0;
        return {
            title: '伙伴养车',
            path: '/pages/my-invitation/invitation?userId=' + userId
        };
    }
});
