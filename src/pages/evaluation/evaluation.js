import { post } from '../../utils/api';
import { uploadFileUrl } from '../../config';
import { toastMsg, confirmMsg } from '../../utils/util';
Page({
    data: {
        cntentLength: 0,
        imageList: [],
        form: {
            order_id: '',
            star: 0,
            store_star: 0,
            content: '',
            pic_url: [],
            category: 3 //1服务开单2清洗开单3订单4计次记录
        }
    },
    /**
     * 评分
     */
    changeStar: function(e) {
        let rate = e.currentTarget.dataset.rate;
        if (e.currentTarget.dataset.type === 'attitude') {
            this.setData({
                'form.star': rate
            });
            return;
        }
        this.setData({
            'form.store_star': rate
        });
    },
    /**
     * 获取评价内容
     */
    getContent: function(e) {
        let content = e.detail.value;
        this.setData({
            'form.content': content,
            cntentLength: content.length
        });
    },
    /**
     * 返回上一页
     */
    goBack: function() {
        wx.navigateBack({
            delta: 1
        });
    },
    /**
     * 添加评价
     */
    submitEvaluation: function(e) {
        if (this.data.form.content === '') {
            toastMsg('评价内容不能为空', 'error');
            return;
        }
        wx.showLoading({
            title: '提交请求中',
            mask: true
        });
        post('weapp/evaluate', this.data.form).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                toastMsg('评价成功', 'success', 1000, () => {
                    this.goBack();
                });
            } else {
                toastMsg(res.errmsg, 'error', 1000, () => {
                    this.goBack();
                });
            }
        });
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
                let pics = this.data.form.pic_url,
                    data = JSON.parse(res.data);
                pics.push(data.data);
                this.setData({
                    'form.pic_url': pics
                });
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
            }
        });
    },
    /**
     * 选择图片
     */
    chooseImages: function() {
        if (this.data.imageList.length >= 3) {
            toastMsg('最多上传3张图片', 'error');
        } else {
            wx.chooseImage({
                sizeType: ['original', 'compressed'],
                sourceType: ['album', 'camera'],
                count: 3,
                success: res => {
                    let successUp = 0; //成功个数
                    let failUp = 0; //失败个数
                    let length = res.tempFilePaths.length; //总张数
                    let i = 0; //第几张
                    this.setData({
                        imageList: this.data.imageList.concat(res.tempFilePaths)
                    });
                    this.uploadImages(res.tempFilePaths, successUp, failUp, i, length);
                }
            });
        }
    },
    /**
     * 图片预览
     */
    previewImage: function(e) {
        let current = e.target.dataset.src;
        wx.previewImage({
            current: current,
            urls: this.data.imageList
        });
    },
    /**
     * 删除图片
     */
    deleteImage: function(e) {
        let index = e.currentTarget.dataset.index,
            images = this.data.imageList,
            pics = this.data.form.pic_url;
        images.splice(index, 1);
        pics.splice(index, 1);
        this.setData({
            imageList: images,
            'form.pic_url': pics
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let params = JSON.parse(options.params);
        this.setData({
            'form.order_id': params.id,
            'form.category': params.category
        });
    }
});