import api from '../../../utils/api';
import { uuid, showLoading } from '../../../utils/util';
Page({
    data: {
        card: {},
        form: {
            merchant_id: 0,
            store_id: 0,
            shareholder_id: 0,
            customer_id: 0
        }
    },
    /**
     * 获取会员卡详情
     */
    getDetail: function() {
        showLoading();
        api.get('weapp/get-shareholder-card', this.data.form).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({ card: res.data });
            }
        });
    },
    /**
     * 创建分享记录
     */
    createShareRecord: function(urlUuid) {
        const shareForm = {
            url: 'pages/get-card/index?uuid=' + urlUuid,
            merchant_id: this.data.form.merchant_id,
            store_id: this.data.form.store_id,
            customer_card_id: this.data.card.customer_card_id,
            level: 1,
            shareholder_id: this.data.form.shareholder_id
        };
        api.post('weapp/add-record', shareForm).then(res => {
            console.log(res.errmsg);
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({ form: JSON.parse(options.params) });
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
                this.data.form.shareholder_id +
                '&customer_card_id=' +
                this.data.card.customer_card_id +
                '&merchant_id=' +
                this.data.form.merchant_id +
                '&store_id=' +
                this.data.form.store_id +
                '&level=1' +
                '&recommend_type=3' +
                '&recommend_user=' +
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
