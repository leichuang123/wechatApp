import api from '../../utils/api.js';
import { showLoading } from '../../utils/util.js';
import WxParse from '../../assets/plugins/wxParse/wxParse';
Page({
    data: {
        isLike: false,
        case: {},
    },
    getDetail: function(id) {
        showLoading();
        api.get('weapp/get-construction-case-details', { id: id }).then(res => {
            wx.hideLoading();
            if (res.errcode === 0) {
                this.setData({
                    case: res.data
                });
                WxParse.wxParse('detail', 'html', res.data.details, this, 15);
            }
        })
    },
    like: function() {
        api.post('weapp/like-num-increment', { id: this.data.case.id }).then(res => {
            if (res.errcode === 0) {
                this.setData({
                    'case.like_num': this.data.case.like_num + 1,
                    isLike: true
                });
            }
        });
    },
    inrementReadCount: function() {
        api.post('weapp/read-num-increment', { id: this.data.case.id }).then(res => {
            console.log(res);
        });
    },
    gotoIndex:function(){
        wx.switchTab({
            url:'/pages/index/index'
        });
    },
    onLoad: function(options) {
        this.getDetail(options.id);
    },
    onShow: function() {

    },
    onUnload:function(){
        this.inrementReadCount();
    },
    onShareAppMessage: function() {
        return {
            title: '施工案例--' + this.data.case.name,
            path: '/pages/construction-case/detail?id=' + this.data.case.id
        };
    }
})