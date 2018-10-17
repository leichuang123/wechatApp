import { getRequest } from '../../../utils/api';
import { confirmMsg } from '../../../utils/util';
Page({
    data: {
        loading: true,
        progressData: {},
        form: {
            order_id: 0,
            order_number: '',
            name: '',
            type: 0,
            money: 0
        },
        searchForm: {
            order_id: 0,
            type: 0,
        }
    },
    /**
     * 查看进度
     */
    viewProgress: function () {
        getRequest('weapp/business-view-progress', this.data.searchForm, false).then(res => {
            this.setData({ loading: false, });
            if (res.errcode === 0) {
                this.setData({
                    progressData: res.data,
                });
            } else {
                confirmMsg('提示', res.errmsg, false);
            }
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let params = JSON.parse(options.params);
        this.setData({
            form: params,
            'searchForm.order_id': params.order_id,
            'searchForm.type': params.type
        });

        this.viewProgress();
    }
})