import api from '../../utils/api';
import { toastMsg } from '../../utils/util';
const app = getApp();
Page({
    data: {
        inputShowed: false,
        loadingVisible: true,
        hasData: true,
        loadNore: false,
        hasMore: true,
        favorites: [],
        scrollHeight: app.globalData.windowHeight - 59,
        scrollTop: 59,
        searchForm: {
            store_name: '',
            longitude: '',
            latitude: '',
            page: 1
        },
        memberForm: {
            store_id: 0,
            store_name: '',
            merchant_id: 0,
            registered: false
        }
    },
    showInput: function() {
        this.setData({
            inputShowed: true
        });
    },
    hideInput: function() {
        this.setData({
            'searchForm.store_name': '',
            inputShowed: false
        });
    },
    clearInput: function() {
        this.setData({
            'searchForm.store_name': ''
        });
    },
    inputTyping: function(e) {
        this.setData({
            'searchForm.store_name': e.detail.value
        });
    },
    /**
     * 获取收藏夹
     */
    getFavorites: function() {
        api.get('weapp/favorlist', this.data.searchForm).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    favorites: this.data.favorites.concat(res.data.data)
                });
            }
            let hasMore = res.errcode !== 0 || this.data.searchForm.page >= res.data.last_page ? false : true;
            this.setData({
                loadMoreVisible: false,
                loadingVisible: false,
                hasMore: hasMore,
                hasData: this.data.favorites.length === 0 ? false : true
            });
        });
    },
    /**
     * 取消门店收藏
     */
    deleteFavorites: function(e) {
        api.post('weapp/delfavor', { store_id: e.target.id }).then(res => {
            if (res.errcode === 0) {
                toastMsg('删除成功', 'success', 1000, () => {
                    this.resetData();
                    this.getFavorites();
                });
            } else {
                toastMsg(res.errmsg, 'error');
            }
        });
    },
    /**
     * 查询收藏夹
     */
    queryFavorites: function(e) {
        if (!e.detail.value) {
            return;
        }
        this.setData({
            hasData: true,
            hasMore: true,
            loadMoreVisible: false,
            loadingVisible: true,
            favorites: [],
            'searchForm.page': 1,
            'searchForm.store_name': e.detail.value
        });
        this.getFavorites();
    },
    /**
     * 跳转到门店简介或评价页面
     */
    gotoStoreService: function(e) {
        const item = e.currentTarget.dataset.item;
        const userData = wx.getStorageSync('userData');
        const memberData = JSON.stringify({
            store_id: item.sid,
            store_name: item.store_name,
            merchant_id: item.merchans_id,
            registered: userData.registered,
            longitude: this.data.searchForm.longitude,
            latitude: this.data.searchForm.latitude
        });
        wx.setStorageSync('currentStore', item);
        wx.navigateTo({
            url: '/pages/goods-list/goods-list?memberData=' + memberData
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
            'searchForm.page': this.data.searchForm.page + 1
        });
        this.getFavorites();
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
     * 重置数据
     */
    resetData: function() {
        this.setData({
            hasData: true,
            hasMore: true,
            loadMoreVisible: false,
            loadingVisible: true,
            favorites: [],
            'searchForm.page': 1
        });
    },
    /**
     * 获取用户位置信息
     */
    getLocation: function() {
        app.getLocation(res => {
            this.setData({
                'searchForm.latitude': res.latitude,
                'searchForm.longitude': res.longitude
            });
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getFavorites();
        this.getLocation();
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.resetData();
        this.getFavorites();
    }
});
