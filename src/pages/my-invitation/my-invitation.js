import { get } from '../../utils/api';
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        hasMore: false,
        loadMoreVisible: false,
        invitedNumber: 0,
        totalBrokerage: 0,
        list: [],
        page: 1
    },
    /**
     * 获取佣金明细
     */
    getList: function() {
        get('weapp/brokerage-detail', { page: this.data.page }).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    invitedNumber: res.data.my_invite_num,
                    totalBrokerage: res.data.total_brokerage,
                    list: this.data.list.concat(res.data.detail.data)
                });
            }
            let hasMore = res.errcode !== 0 || this.data.page >= res.data.detail.last_page ? false : true;
            this.setData({
                hasMore: hasMore,
                loadMoreVisible: false,
                loadingVisible: false,
                hasData: this.data.list.length === 0 ? false : true
            });
        });
    },
    /**
     * 返回到上一页
     */
    goBack: function() {
        wx.switchTab({
            url: '/pages/mine/mine'
        });
    },
    /**
     * 跳转到邀请页面
     */
    gotoInvitation: function() {
        wx.navigateTo({
            url: 'invitation'
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
            page: this.data.page + 1
        });
        this.getList();
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getList();
    }
});