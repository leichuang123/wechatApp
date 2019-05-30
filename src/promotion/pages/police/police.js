import api from '../../../utils/api';
import { toastMsg } from '../../../utils/util';
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        hasMore: true,
        loadMoreVisible: false,
        list: [],
        page_num: 1,
        total_page: 1
    },
    //获取报警信息
    plice: function() {
        const self = this;
        const param = {
            obd_device_id: wx.getStorageSync('obd_device_id')[0],
            page_num: self.data.page_num
        };
        api.get('weapp-obd-exception/device-exception-list', param).then(res => {
            if (res.errcode != 0) {
                toastMsg(res.errmsg, 'error');
                self.setData({
                    hasData: true
                });
                return;
            }
            let hasMore = res.errcode !== 0 || self.data.page_num >= res.data.total_page ? false : true;
            self.setData({
                list: self.data.list.concat(res.data.exceptions),
                page_num: res.data.page_now,
                total_page: res.data.total_page,
                loadMoreVisible: false,
                loadingVisible: false,
                hasMore: hasMore,
                hasData: res.data.exceptions.length === 0 ? false : true
            });
        });
    },
    /**
     * 下拉刷新
     */
    onPullDownRefresh: function() {
        this.setData({
            loadingVisible: true,
            loadMoreVisible: false,
            hasData: true,
            hasMore: true,
            page_num: 1,
            list: []
        });
        this.plice();
    },
    /**
     * 下拉加载更多
     */
    onReachBottom: function() {
        if (!this.data.hasMore || this.data.page_num >= this.data.totalPage) {
            return;
        }
        this.setData({
            loadMoreVisible: true,
            page_num: this.data.page_num + 1
        });
        this.plice();
    },
    onLoad: function(options) {
        this.plice();
    },
    onShow: function() {}
});
