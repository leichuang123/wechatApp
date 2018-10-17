import { getRequest } from '../../../utils/api';
const app = getApp();
Page({
    data: {
        loadingVisible: true,
        hasData: true,
        hasMore: true,
        loadMoreVisible: false,
        open: false,
        records: [],
        currentType: '全部',
        timeIndex: 0,
        typeList: [
            { id: '', name: '全部' },
            { id: 'I', name: '收入' },
            { id: 'O', name: '支出' }
        ],
        timeList: [
            { id: 1, name: '最近1个月' },
            { id: 6, name: '最近3个月' },
            { id: 12, name: '最近1年' }
        ],
        form: {
            shareholder_id: 0,
            type: '',
            time: 1,
            page: 1
        }
    },
    /**
     * 展开与折叠菜单
     */
    toggleMenu: function() {
        this.setData({ open: !this.data.open });
    },
    /**
     * 选择类型
     */
    chooseType: function(e) {
        let index = e.currentTarget.dataset.index;
        this.setData({
            currentType: this.data.typeList[index].name,
            'form.type': this.data.typeList[index].id,
            open: !this.data.open,
            loadingVisible: true,
            hasMore: true,
            hasData: true,
            records: [],
            'form.page': 1
        });
        this.getRecords();
    },
    /**
     * 选择时间段
     */
    chooseMonth: function(e) {
        let index = e.currentTarget.dataset.index;
        this.setData({
            'form.time': this.data.timeList[index].id,
            timeIndex: index,
            loadingVisible: true,
            hasMore: true,
            hasData: true,
            records: [],
            'form.page': 1
        });
        this.getRecords();
    },
    /**
     * 获取收支明细列表
     */
    getRecords: function() {
        getRequest('weapp/get-account-flow-record', this.data.form).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    records: this.data.records.concat(res.data.data)
                });
            }
            let hasMore = (res.errcode !== 0 || this.data.form.page >= res.data.last_page) ? false : true;
            this.setData({
                loadMoreVisible: false,
                loadingVisible: false,
                hasMore: hasMore,
                hasData: this.data.records.length === 0 ? false : true
            });
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            'form.shareholder_id': options.id
        });
        this.getRecords();
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.setData({
            loadingVisible: true,
            hasMore: true,
            hasData: true,
            records: [],
            'form.page': 1
        });
        this.getRecords();
    },
    /**
    * 加载更多
    */
    onReachBottom: function () {
        if (!this.data.hasMore) {
            return;
        }
        this.setData({
            loadMoreVisible: true,
            'form.page': this.data.form.page + 1,
        });
        this.getRecords();
    }
})