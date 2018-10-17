import { uploadFileUrl } from '../../../config';
import { postRequest } from '../../../utils/api';
import { toastMsg, confirmMsg } from '../../../utils/util';
Page({
    data: {
        loading: false,
        contentLength: 0,
        imageList: [],
        form: {
            order_id: '',
            order_number: '',
            reason: '',
            file: []
        }
    },
    /**
     * 上传图片
     */
    uploadImages: function(filePaths, successUp, failUp, i, length) {
        wx.uploadFile({
            url: uploadFileUrl,
            filePath: filePaths[i],
            name: 'img',
            success: res => {
                if (res.statusCode === 413) {
                    confirmMsg('', '图片大小不能超过1M', false);
                    return;
                }
                successUp++;
                let pics = this.data.form.file,
                    data = JSON.parse(res.data);
                pics.push(data.data);
                this.setData({
                    'form.file': pics
                })
            },
            fail: res => {
                failUp++;
            },
            complete: () => {
                i++;
                if (i == length) {
                    console.log('总共' + successUp + '张上传成功,' + failUp + '张上传失败！');
                } else {
                    this.uploadImages(filePaths, successUp, failUp, i, length);
                }
            },
        })
    },
    /**
     * 选择图片
     */
    chooseImage: function() {
        if (this.data.imageList.length >= 3) {
            confirmMsg('提示', '最多只能上传3张图片', false);
            return;
        }
        wx.chooseImage({
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            count: 3,
            success: res => {
                let successUp = 0,
                    failUp = 0,
                    length = res.tempFilePaths.length,
                    i = 0;
                this.setData({
                    imageList: this.data.imageList.concat(res.tempFilePaths)
                });
                this.uploadImages(res.tempFilePaths, successUp, failUp, i, length);
            }
        });
    },
    /**
     * 图片预览
     */
    previewImage: function(e) {
        wx.previewImage({
            current: e.currentTarget.dataset.src,
            urls: this.data.imageList
        });
    },
    /**
     * 删除图片
     */
    deleteImage: function(e) {
        let index = e.currentTarget.dataset.index,
            images = this.data.imageList,
            pics = this.data.form.file;
        images.splice(index, 1);
        pics.splice(index, 1);
        this.setData({
            imageList: images,
            'form.file': pics
        });
    },
    /**
     * 获取投诉原因
     */
    getReason: function(e) {
        let value = e.detail.value;
        this.setData({
            'form.reason': value,
            contentLength: value.length
        });
    },
    /**
     * 返回上一页
     */
    goBack: function() {
        wx.navigateBack({
            delta: 1,
        });
    },
    /**
     * 提交投诉
     */
    submintComplain: function(e) {
        if (this.data.form.reason === '') {
            confirmMsg('提示', '请填写投诉原因', false);
            return;
        }
        postRequest('weapp/business-complain', this.data.form).then(res => {
            if (res.errcode === 0) {
                toastMsg('投诉成功', 'success', 1000, () => {
                    this.goBack();
                });
            } else {
                confirmMsg('提示', res.errmsg, false, () => {
                    this.goBack();
                });
            }
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let params = JSON.parse(options.params);
        this.setData({
            'form.order_id': params.order_id,
            'form.order_number': params.order_number
        });
    }
})