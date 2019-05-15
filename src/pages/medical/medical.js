import api from '../../utils/api';
import { uploadFileUrl, host } from '../../config';
import { confirmMsg, toastMsg } from '../../utils/util';
Page({
    data: {
        indicatorDots: false,
        autoplay: false,
        interval: 3000,
        duration: 1000,
        imgUrls: [
            'https://sh.huobanyc.com/images/weapp/obd_banner_1.jpeg',
            'https://sh.huobanyc.com/images/weapp/obd_banner_2.jpeg'
        ],
        hasBind: true,
        disabled: false,
        height: '',
        box: {
            cardNum: ' ',
            simNum: '', //sim卡
            obdNum: '' //ime玛
        },
        type: '',
        imgsrc: '',
        obd_device_id: ''
    },
    //获取智能盒详情
    getObd() {
        const param = {
            obd_device_id: wx.getStorageSync('obd_device_id')[0]
        };
        const self = this;
        api.get('weapp-obd-user/get-device', param).then(res => {
            if (res.errcode != 0) {
                confirmMsg('', res.errmsg, false);
                return;
            }
            self.setData({
                'box.cardNum': res.data.car_number,
                'box.simNum': res.data.sim,
                'box.obdNum': res.data.imei,
                imgsrc: res.data.head_img,
                obd_device_id: res.data.obd_device_id
            });
        });
    },
    wxChooseImage: function() {
        let that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success(res) {
                that.uploadImage(res.tempFilePaths);
            }
        });
    },
    uploadImage: function(tempFilePaths) {
        const self = this;
        wx.uploadFile({
            url: uploadFileUrl,
            filePath: tempFilePaths[0],
            name: 'img',
            success(res) {
                if (res.statusCode == 200) {
                    const data = JSON.parse(res.data);
                    self.setData({
                        imgsrc: host + data.data.url
                    });
                } else {
                    confirmMsg('提示', '上传图片出错', false);
                    return false;
                }
            },
            fail(res) {
                confirmMsg('', '上传图片出错', false);
            }
        });
    },
    /**
     * 绑定设备
     */
    bindObd: function() {
        this.setData({
            hasBind: false
        });
    },
    /**
     *点击选车
     */
    showKeyboard: function() {
        if (this.data.disabled == true) {
            confirmMsg('', '不能修改绑定车辆', false);
            return;
        }
        wx.navigateTo({
            url:
                '/pages/mylove-car/mylove-car?type=' +
                this.data.type +
                '&simNum=' +
                this.data.box.simNum +
                '&obdNum=' +
                this.data.box.obdNum
        });
    },
    /**
     * 获取simNum
     */
    getsimNum: function(e) {
        this.setData({
            'box.simNum': e.detail.value
        });
    },
    /**
     * obdNum
     */
    obdNum: function(e) {
        this.setData({
            'box.obdNum': e.detail.value
        });
    },
    /**
     * 扫码
     */

    scan: function() {
        if (this.data.type == 3) {
            confirmMsg('', '暂不支持修改设备号', false);
            return;
        }
        const self = this;
        wx.scanCode({
            success(res) {
                if (res.errMsg == 'scanCode:ok') {
                    self.setData({
                        'box.obdNum': res.result
                    });
                    return;
                }
                confirmMsg('', '扫描失败，请重试', false);
            }
        });
    },
    //完成
    sure: function() {
        const self = this;
        if (self.data.box.cardNum == '' || self.data.box.simNum == '' || self.data.box.obdNum == '') {
            confirmMsg('', '请完善信息', false);
            return;
        } else if (self.data.type == 3) {
            //编辑obd信息
            const param = {
                car_number: self.data.box.cardNum,
                sim: self.data.box.simNum,
                head_img: self.data.imgsrc == '' ? wx.getStorageSync('wxUserInfo').avatarUrl : self.data.imgsrc,
                obd_device_id: self.data.obd_device_id
            };
            api.post('weapp-obd-user/edit-device', param).then(res => {
                if (res.errcode != 0) {
                    confirmMsg('', res.errmsg, false);
                    return;
                }
                toastMsg(res.errmsg, 'success', 1000, () => {
                    wx.navigateTo({
                        url: '/pages/my-obd/box-detail'
                    });
                });
            });
            return;
        } else if (self.data.type == 1) {
            //再次新增obd
            const param = {
                car_number: self.data.box.cardNum,
                sim: self.data.box.simNum,
                imei: self.data.box.obdNum,
                head_img: self.data.imgsrc == '' ? wx.getStorageSync('wxUserInfo').avatarUrl : self.data.imgsrc
            };
            api.post('weapp-obd-user/bind-device', param).then(res => {
                if (res.errcode != 0) {
                    confirmMsg('', res.errmsg, false);
                    return;
                }
                //缓存设备信息
                wx.setStorageSync('obd_device_id', res.data.obd_device_ids);
                wx.navigateTo({
                    url: '/pages/my-obd/my-obd'
                });
            });
        } else {
            //注册obd
            const param = {
                weapp_user_id: wx.getStorageSync('userData').id,
                car_number: self.data.box.cardNum,
                sim: self.data.box.simNum,
                imei: self.data.box.obdNum,
                head_img: self.data.imgsrc == '' ? wx.getStorageSync('wxUserInfo').avatarUrl : self.data.imgsrc
            };
            api.post('weapp-obd-user/register', param).then(res => {
                if (res.errcode != 0) {
                    confirmMsg('', res.errmsg, false);
                    return;
                }
                //缓存设备信息
                wx.setStorageSync('obd_device_id', res.data.obd_device_ids);
                wx.navigateTo({
                    url: '/pages/medical/medical-map'
                });
            });
        }
    },
    /**
     * 跳转到注册页面
     */
    gotoRegister: function() {
        wx.navigateTo({
            url: '/pages/register/register'
        });
    },
    onLoad: function(options) {
        //如果是从我的车库新增
        if (options.type == 1) {
            this.setData({
                hasBind: false,
                type: 1
            });
        }
        //如果是从我的爱车选中
        if (options.carName) {
            this.setData({
                hasBind: false,
                'box.cardNum': options.carName,
                'box.simNum': options.simNum || '',
                'box.obdNum': options.obdNum || ''
            });
        }
        //如果是从智能盒详情进入修改
        if (options.type == 3) {
            this.setData({
                hasBind: false,
                disabled: true,
                type: 3
            });
            wx.setNavigationBarTitle({
                title: '编辑智能盒'
            });
            this.getObd();
        }
        const phoneData = wx.getStorageSync('systemInfo');
        this.setData({
            height: phoneData.screenHeight
        });
    }
});
