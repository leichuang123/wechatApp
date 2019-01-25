import api from '../../utils/api';
import { toastMsg, showLoading } from '../../utils/util';
import { openLocation, makePhoneCall } from '../../utils/wx-api';
const app = getApp();
Page({
    data: {
        loadingVisible: false,
        hasData: true,
        hasMore: true,
        loadMoreVisible: false,
        collected: false,
        activeIndex: 0,
        storeInfo: {},
        evaluations: [],
        storeId: 0,
        scrollHeight: app.globalData.windowHeight - 59,
        scrollTop: 59,
        form: {
            storeId: 0,
            merchantId: 0,
            fromPage: '',
            latitude: 0,
            longitude: 0
        },
        evaluationForm: {
            store_id: 0,
            page: 1
        }
    },
    /**
     * 定位
     */
    openLocation: function() {
        openLocation({
            latitude: parseFloat(this.data.storeInfo.store_lati),
            longitude: parseFloat(this.data.storeInfo.store_long),
            scale: 18,
            name: this.data.storeInfo.store_name,
            address: this.data.storeInfo.store_address
        });
    },
    /**
     * 获取门店简介
     */
    getStoreInfo: function() {
        showLoading();
        api.get('weapp/storedetail', this.data.form, false).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({
                    storeInfo: res.data,
                    collected: res.data.favorite_status
                });
            }
        });
    },
    /**
     * 获取门店评价列表
     */
    getEvaluations: function() {
        this.setData({ loadingVisible: true });
        api.get('weapp/evaluatelist', this.data.evaluationForm, false).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    evaluations: this.data.evaluations.concat(res.data.data)
                });
            }
            let hasMore = res.errcode !== 0 || this.data.evaluationForm.page >= res.data.last_page ? false : true;
            this.setData({
                loadMoreVisible: false,
                loadingVisible: false,
                hasMore: hasMore,
                hasData: this.data.evaluations.length === 0 ? false : true
            });
        });
    },
    /**
     * 切换视图
     */
    changView: function(e) {
        let index = e.target.dataset.index;
        if (index == this.data.activeIndex) {
            return;
        }
        this.setData({
            activeIndex: index,
            storeInfo: {},
            evaluations: []
        });
        index == 0 ? this.getStoreInfo() : this.getEvaluations();
    },
    /**
     * 收藏与取消
     */
    switchCollection: function() {
        let operation = !this.data.collected ? 'addfavor' : 'delfavor';
        api.post('weapp/' + operation, { store_id: this.data.storeId }).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    collected: !this.data.collected
                });
            } else {
                toastMsg(res.errmsg, 'error');
            }
        });
    },
    /**
     * 打电话
     */
    call: function(e) {
        let tel = e.currentTarget.dataset.tel;
        makePhoneCall({ phoneNumber: tel })
            .then(res => {
                console.log('拨打成功');
            })
            .catch(() => {
                console.log('拨打失败');
            });
    },
    /**
     * 下拉加载更多
     */
    loadMore: function() {
        if (!this.data.hasMore) {
            return;
        }
        this.setData({
            loadMoreVisible: true,
            'evaluationForm.page': this.data.evaluationForm.page + 1
        });
        this.getEvaluations();
    },
    /**
     * 页面滚动
     */
    scroll: function(e) {
        this.setData({
            scrollTop: e.detail.scrollTop
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let storeData = JSON.parse(options.storeData);
        const wxUserInfo = wx.getStorageSync('wxUserInfo');
        this.setData({
            storeId: storeData.storeId,
            activeIndex: storeData.type,
            form: storeData,
            'evaluationForm.store_id': storeData.storeId,
            'form.user_avatar': wxUserInfo.avatar || ''
        });
        storeData.type == 0 ? this.getStoreInfo() : this.getEvaluations();
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.setData({
            hasData: true,
            hasMore: true,
            evaluations: [],
            'evaluationForm.page': 1
        });
        this.getEvaluations();
    }
});