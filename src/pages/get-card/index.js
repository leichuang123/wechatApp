import api from '../../utils/api';
import { getPageUrl, uuid, showLoading } from '../../utils/util';
Page({
    data: {
        isExpired: false,
        card: {},
        urlUuid: '',
        form: {
            merchant_id: 0,
            store_id: 0,
            customer_card_id: 0,
            shareholder_id: 0
        }
    },
    /**
     * 获取会员卡详情
     */
    getDetail: function() {
        showLoading();
        api.post('weapp/get-share-card-info', this.data.form).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({ card: res.data });
            }
        });
    },
    /**
     * 创建分享信息
     */
    createShareRecord: function(urlUuid) {
        const shareForm = {
            url: 'pages/get-card/index?uuid=' + urlUuid,
            merchant_id: this.data.form.merchant_id,
            store_id: this.data.form.store_id,
            customer_card_id: this.data.form.customer_card_id,
            level: this.data.card.level,
            shareholder_id: this.data.card.shareholder_id
        };
        api.post('weapp/add-record', shareForm).then(res => {
            console.log(res.errmsg);
        });
    },
    /**
     * 检查分享是否过期
     */
    isExpired: function() {
        const params = {
            merchant_id: this.data.form.merchant_id,
            store_id: this.data.form.store_id,
            url: getPageUrl() + '?uuid=' + this.data.urlUuid
        };
        api.get('/weapp/check-url', params).then(res => {
            this.setData({ isExpired: res.errcode !== 0 });
            if (!this.data.isExpired) {
                let params = JSON.stringify({
                    merchant_id: this.data.form.merchant_id,
                    store_id: this.data.form.store_id,
                    customer_card_id: this.data.form.customer_card_id,
                    shareholder_id: this.data.form.shareholder_id,
                    url: 'pages/get-card/index',
                    urlUuid: this.data.urlUuid,
                    level: this.data.card.level
                });
                wx.navigateTo({ url: 'get-card?params=' + params });
            } else {
                wx.navigateTo({ url: 'expired' });
            }
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
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            urlUuid: options.uuid,
            form: {
                merchant_id: options.merchant_id,
                store_id: options.store_id,
                customer_card_id: options.customer_card_id,
                shareholder_id: options.shareholder_id
            }
        });
        this.getDetail();
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(res) {
        if (res.from === 'button') {
            let urlUuid = uuid();
            let sharedUrl =
                '/pages/get-card/index?shareholder_id=' +
                this.data.card.shareholder_id +
                '&customer_card_id=' +
                this.data.form.customer_card_id +
                '&merchant_id=' +
                this.data.form.merchant_id +
                '&store_id=' +
                this.data.form.store_id +
                '&level=' +
                this.data.card.level +
                '&recommendType=3' +
                '&recommendId' +
                this.data.card.store_id +
                '&uuid=' +
                urlUuid;
            this.createShareRecord(urlUuid);
            return {
                title: '股东分享卡',
                path: sharedUrl
            };
        }
    }
});
